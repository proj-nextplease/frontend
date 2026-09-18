import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  House, PlusSquare, Heart, MessageCircle, Send, Share2,
  FileText, BarChart2,
  X, Check, ChevronRight, ArrowLeft, ShieldCheck,
  Sparkles, CheckCircle2, User, Link2, MoreHorizontal,
  Bookmark, Award, ThumbsUp, HelpCircle
} from 'lucide-react';
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

/* ── Brand Color Tokens ── */
const TEAL = '#0d9488';
const EMERALD = '#10b981';
const INK = '#0f2e2b';
const MUTED = '#64748b';
const LINE = '#e2e8f0';
const BG_PAGE = '#f8fafc'; // Upzi soft light gray background
const CARD_BG = '#ffffff';

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

const AVATAR_BGS = ['#dff7ee', '#fff2bd', '#eee5ff', '#dff0ff', '#ffe7d3', '#e4f5c8'];

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
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      color: INK,
      marginTop: '-34px',
      overflowX: 'clip',
    }}>
      {/* Toast Notification */}
      {copyToast && (
        <div style={{
          position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, background: INK, color: '#fff', padding: '12px 24px',
          borderRadius: 999, fontSize: '0.9rem', fontWeight: 600,
          boxShadow: '0 8px 30px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: 8,
          animation: 'fadeIn 0.2s ease',
        }}>
          <CheckCircle2 size={18} color="#34d399" />
          Đã sao chép liên kết bài viết vào bộ nhớ tạm!
        </div>
      )}

      <style>{`
        .np-discussion-layout {
          width: min(1400px, calc(100% - 40px));
          margin: 0 auto;
          padding: 24px 0 80px;
          display: grid;
          grid-template-columns: 1fr minmax(auto, 720px) 1fr;
          gap: 32px;
          align-items: start;
        }
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
            padding: 16px 12px 60px !important;
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

      {/* Main Global Header */}
      <SiteHeader />

      {/* Page Content Container (Dead-centered feed, Left Sidebar flush to the left) */}
      <div className="np-discussion-layout">
        {/* ── LEFT SIDEBAR ── */}
        <aside className="np-discussion-sidebar" style={{ position: 'sticky', top: 90, justifySelf: 'start', width: '100%', maxWidth: 240 }}>
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
                background: activeTab === 'danh-cho-ban' ? '#e2e8f0' : 'transparent',
                color: activeTab === 'danh-cho-ban' ? '#0f172a' : '#475569',
                fontWeight: activeTab === 'danh-cho-ban' ? 700 : 600,
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'danh-cho-ban') e.currentTarget.style.background = '#f1f5f9';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'danh-cho-ban') e.currentTarget.style.background = 'transparent';
              }}
            >
              <House size={20} color={activeTab === 'danh-cho-ban' ? '#0f172a' : '#64748b'} strokeWidth={2.4} />
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
                color: '#334155',
                fontWeight: 600,
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <PlusSquare size={20} color="#475569" strokeWidth={2.2} />
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
                  border: '1px solid #e2e8f0',
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
                    background: '#f1f5f9',
                    borderRadius: 9999,
                    padding: '10px 18px',
                    fontSize: '0.92rem',
                    color: '#64748b',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                >
                  Bạn có điều gì muốn hỏi không?
                </div>

                {/* Action Icons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#475569' }}>
                  {/* Đính kèm ảnh/tệp chưa triển khai — xem README phần Thảo Luận. */}
                  <button
                    onClick={() => requireAuth(() => {
                      setNewPostPollEnabled(true);
                      setIsCreateModalOpen(true);
                    })}
                    title="Tạo cuộc bình chọn"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4 }}
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
                      border: '1px solid #e2e8f0',
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
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                  color: '#0f172a',
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
                  border: '1px solid #e2e8f0',
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
                      <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {currentTopic.name}
                      </h1>
                      <ShieldCheck size={20} color="#8b5cf6" />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 6 }}>
                      Chủ đề chính thức · được NextPlease quản trị
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
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
                    background: followedTopics[currentTopic.id] ? '#f1f5f9' : '#8b5cf6',
                    color: followedTopics[currentTopic.id] ? '#475569' : '#ffffff',
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
                  border: '1px solid #e2e8f0',
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
                    background: '#f1f5f9',
                    borderRadius: 9999,
                    padding: '10px 18px',
                    fontSize: '0.92rem',
                    color: '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  Chia sẻ quan điểm {currentTopic.name} của bạn...
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#475569' }}>
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
                      background: filterMode === 'newest' ? '#e2e8f0' : 'transparent',
                      color: filterMode === 'newest' ? '#0f172a' : '#64748b',
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
                      background: filterMode === 'highlight' ? '#e2e8f0' : 'transparent',
                      color: filterMode === 'highlight' ? '#0f172a' : '#64748b',
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
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  {displayedPosts.length} bài viết tuần này
                </span>
              </div>
            </div>
          )}

          {/* 3. POST FEED STREAM */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {actionError && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
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
                textAlign: 'center', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600,
              }}>
                Đang tải bài viết…
              </div>
            ) : feedError ? (
              <div style={{
                background: CARD_BG, borderRadius: 20, padding: '48px 24px',
                textAlign: 'center', border: '1px solid #fecaca', color: '#b91c1c', fontWeight: 600,
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
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
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
                      border: '1px solid #e2e8f0',
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
                        style={{ color: '#0f172a' }}
                      />

                      {/* Author Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', lineHeight: 1.3 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.98rem', color: '#0f172a' }}>
                            {post.author.name}
                          </span>
                          <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>›</span>
                          <button
                            onClick={() => handleSelectTopic(post.topicId)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              fontWeight: 700,
                              fontSize: '0.92rem',
                              color: '#0f172a',
                              cursor: 'pointer',
                            }}
                          >
                            {post.topicName}
                          </button>
                          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>· {post.timeAgo}</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 3 }}>
                          {post.author.role}
                        </div>
                      </div>
                    </div>

                    {/* Post Body Content */}
                    <div style={{
                      fontSize: '0.93rem',
                      lineHeight: 1.65,
                      color: '#1e293b',
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
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 14,
                          padding: '10px 16px',
                          marginBottom: 16,
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#334155',
                        }}
                      >
                        <FileText size={18} color="#64748b" />
                        <span style={{ textDecoration: 'underline' }}>{post.attachment.name}</span>
                      </div>
                    )}

                    {/* Interactive Poll Component (if any) */}
                    {post.poll && (
                      <div
                        style={{
                          background: '#f8fafc',
                          borderRadius: 16,
                          padding: '16px',
                          border: '1px solid #e2e8f0',
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
                                  background: isSelected ? '#ecfdf5' : '#ffffff',
                                  border: isSelected ? `1.5px solid ${TEAL}` : '1px solid #cbd5e1',
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
                                      background: isSelected ? '#a7f3d0' : '#e2e8f0',
                                      opacity: 0.45,
                                      zIndex: 0,
                                      transition: 'width 0.4s ease',
                                    }}
                                  />
                                )}
                                <span style={{ position: 'relative', zIndex: 1, fontWeight: isSelected ? 700 : 500, fontSize: '0.9rem', color: '#1e293b' }}>
                                  {option.text}
                                </span>
                                {post.poll.votedOption && (
                                  <span style={{ position: 'relative', zIndex: 1, fontWeight: 700, fontSize: '0.88rem', color: isSelected ? TEAL : '#64748b' }}>
                                    {percent}%
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 10, textAlign: 'right' }}>
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
                        borderTop: '1px solid #f1f5f9',
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
                          color: post.hasLiked ? '#ef4444' : '#64748b',
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
                          color: '#64748b',
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
                            color: '#64748b',
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
                              background: '#ffffff',
                              borderRadius: 14,
                              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                              border: '1px solid #e2e8f0',
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
                                color: '#1e293b',
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
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
                                color: '#1e293b',
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
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
                      <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
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
                                  style={{ color: '#0f172a' }}
                                />
                                <div style={{ background: '#f8fafc', borderRadius: 12, padding: '10px 14px', flex: 1, border: '1px solid #f1f5f9' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{comment.author}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>· {comment.timeAgo}</span>
                                  </div>
                                  <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>{comment.content}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 12px' }}>Chưa có bình luận nào. Hãy là người đầu tiên thảo luận!</p>
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
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
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
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 24,
              maxWidth: 580,
              width: '100%',
              padding: '24px 28px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
              border: '1px solid #e2e8f0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Tạo bài viết mới
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} color="#475569" />
              </button>
            </div>

            <form onSubmit={handleCreatePost}>
              {/* Topic Selector */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                  Chọn chủ đề:
                </label>
                <select
                  value={newPostTopic}
                  onChange={(e) => setNewPostTopic(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    outline: 'none',
                    background: '#f8fafc',
                  }}
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Text Area */}
              <div style={{ marginBottom: 16 }}>
                <textarea
                  rows={5}
                  placeholder="Bạn muốn chia sẻ điều gì với cộng đồng hôm nay?..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 14,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    outline: 'none',
                    fontFamily: 'inherit',
                    resize: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Poll Toggle / Options */}
              {newPostPollEnabled ? (
                <div style={{ background: '#f8fafc', borderRadius: 14, padding: 14, border: '1px solid #e2e8f0', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Tùy chọn bình chọn:</span>
                    <button
                      type="button"
                      onClick={() => setNewPostPollEnabled(false)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Hủy bình chọn
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {pollOptions.map((opt, idx) => (
                      <input
                        key={idx}
                        type="text"
                        placeholder={`Lựa chọn ${idx + 1}...`}
                        value={opt}
                        onChange={(e) => {
                          const next = [...pollOptions];
                          next[idx] = e.target.value;
                          setPollOptions(next);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 10,
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    ))}
                    {pollOptions.length < 4 && (
                      <button
                        type="button"
                        onClick={() => setPollOptions([...pollOptions, ''])}
                        style={{
                          background: 'none',
                          border: '1px dashed #cbd5e1',
                          borderRadius: 10,
                          padding: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: TEAL,
                          cursor: 'pointer',
                        }}
                      >
                        + Thêm lựa chọn
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                  <button
                    type="button"
                    onClick={() => setNewPostPollEnabled(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: '#f1f5f9',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: 10,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    <BarChart2 size={16} /> Thêm bình chọn
                  </button>
                </div>
              )}

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 9999,
                    background: '#f1f5f9',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingPost || !newPostContent.trim()}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 9999,
                    background: TEAL,
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: '#ffffff',
                    cursor: creatingPost || !newPostContent.trim() ? 'not-allowed' : 'pointer',
                    opacity: creatingPost || !newPostContent.trim() ? 0.6 : 1,
                    boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)',
                  }}
                >
                  {creatingPost ? 'Đang đăng…' : 'Đăng bài'}
                </button>
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
