import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeroMesh } from '../components/HeroMesh.jsx';
import { PortfolioMascot } from '../components/PortfolioMascot.jsx';
import { MASCOTS, mascotSheets, resolveMascot } from '../lib/mascots.js';
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  BriefcaseBusiness,
  FileUp,
  Eye,
  Plus,
  Sparkles,
  UserRound,
  Trash2,
  AlertTriangle,
  ChevronDown,
  Link as LinkIcon,
  LockKeyhole,
  Code2,
  Link2,
  Globe,
  Mail,
} from 'lucide-react';
import { getMyPortfolio, updateMyPortfolio } from '../api/portfolioApi.js';
import { FilePreviewModal } from '../components/FilePreviewModal.jsx';
import { CoverBannerEditor } from '../components/CoverBannerEditor.jsx';
import { EXPERIENCE_CATEGORY_OPTIONS, EXPERIENCE_ROLE_LEVEL_OPTIONS } from '../constants/experience.js';

export const PORTFOLIO_PREVIEW_STORAGE_PREFIX = 'nextplease:portfolio-preview:';

/** Return a shallow copy of `obj` without the given keys (used to drop heavy
 * base64 blobs before persisting a localStorage draft). */
function stripKeys(obj, keys) {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key)));
}

/**
 * Merge the server's experiences with a locally-saved draft.
 *
 * The server copy is the source of truth for *which rows exist* — it includes
 * proof-of-work submissions made outside the Portfolio editor (the dashboard
 * "Nộp minh chứng" form). The draft only carries the user's unsaved edits. So:
 *   - keep every server row; if the draft has a newer version of it (same id),
 *     use the draft's edited content;
 *   - append draft rows that have no server match (newly added, not saved yet).
 * This prevents a stale draft from dropping server rows, which on save would
 * make the backend delete them as orphaned PENDING experiences.
 */
function mergeExperiences(serverExperiences, draftExperiences) {
  if (!Array.isArray(draftExperiences)) return serverExperiences;

  const draftById = new Map();
  for (const exp of draftExperiences) {
    if (exp?.id != null) draftById.set(String(exp.id), exp);
  }

  const serverIds = new Set((serverExperiences || []).map((exp) => String(exp.id)));

  const merged = (serverExperiences || []).map((exp) => {
    const draftVersion = draftById.get(String(exp.id));
    return draftVersion ? { ...exp, ...draftVersion } : exp;
  });

  // Draft rows not present on the server yet (newly added in the editor).
  for (const exp of draftExperiences) {
    if (exp?.id == null || !serverIds.has(String(exp.id))) {
      merged.push(exp);
    }
  }

  return merged;
}

/**
 * Merge server credentials with a draft. The draft carries the user's unsaved
 * text edits but — to stay under the localStorage quota — no longer holds the
 * base64 file bytes (fileData/fileType). So we layer the draft's edits on top of
 * the server row but keep the server's fileData/fileType, otherwise an uploaded
 * certificate would become unviewable after a reload that loads from a draft.
 */
function mergeCredentials(serverCredentials, draftCredentials) {
  if (!Array.isArray(draftCredentials)) return serverCredentials;

  const serverById = new Map();
  for (const cred of serverCredentials || []) {
    if (cred?.id != null) serverById.set(String(cred.id), cred);
  }

  return draftCredentials.map((cred) => {
    const serverVersion = cred?.id != null ? serverById.get(String(cred.id)) : null;
    if (!serverVersion) return cred;
    return {
      ...cred,
      fileData: cred.fileData || serverVersion.fileData || '',
      fileType: cred.fileType || serverVersion.fileType || '',
    };
  });
}

const defaultExperiences = [
  {
    id: 1,
    title: '',
    organization: '',
    detail: '',
    category: 'CLUB_SMALL',
    roleLevel: 'MEMBER',
    proofLink: '',
    startDate: '',
    endDate: '',
    proofImages: [],
  },
];

/* Hồ sơ chỉ còn lưu id linh vật, cộng giới tính để suy ra linh vật cho những
   hồ sơ CŨ đã lưu trước khi đổi (xem lib/mascots.js). Các trường skinTone /
   hairStyle / accessory / pose đã bỏ cùng với nhân vật 3D. */
const defaultAvatar = {
  gender: 'female',
  mascot: 'ballerina',
};
const defaultCredentials = [
  {
    id: 1,
    name: '',
    issuer: '',
    issuedAt: '',
    fileName: '',
    fileData: '',
    fileType: '',
  },
];

/* Mốc tan của mesh, bằng px. Trang này cao gấp ba lần một trang thường, nên
   quầng sáng chỉ phủ phần đầu (tiêu đề + đỉnh hai cột) rồi trả về nền ink
   phẳng, để khu vực nhập liệu không phải đọc chữ trên nền loang màu. */
const PF_MESH_MASK = 'linear-gradient(to bottom, #000 0px, #000 260px, transparent 720px)';

export function CandidatePortfolioPage({ isEditing = false }) {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [profile, setProfile] = useState({
    name: '',
    headline: '',
    school: '',
    location: '',
    bio: '',
    skills: '',
    openToWork: false,
    socialLinks: { github: '', linkedin: '', website: '', email: '' },
    coverBannerUrl: '',
    coverBannerPos: '50% 50%',
  });
  const [experiences, setExperiences] = useState(defaultExperiences);
  const [credentials, setCredentials] = useState(defaultCredentials);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);
  const [isDraftDirty, setIsDraftDirty] = useState(false);
  const [showExitWarningModal, setShowExitWarningModal] = useState(false);
  const [errors, setErrors] = useState({});

  function markDirty() {
    setIsDraftDirty(true);
  }


  useEffect(() => {
    async function loadPortfolio() {
      try {
        setIsLoading(true);
        const data = await getMyPortfolio();
        if (data) {
          if (data.onboardingCompleted && !isEditing) {
            navigate('/candidates/dashboard');
            return;
          }

          // 1. If headline is the default placeholder, parse it as empty
          const dbHeadline = data.headline === "Ứng viên nextplease" ? "" : (data.headline || "");

          // 2. Check if a local draft exists
          const localDraftJson = localStorage.getItem('nextplease:portfolio-draft');
          let draftLoaded = false;

          if (localDraftJson) {
            try {
              const draft = JSON.parse(localDraftJson);
              if (draft.profile) {
                if (draft.profile.headline === "Ứng viên nextplease") {
                  draft.profile.headline = "";
                }
                setProfile({
                  openToWork: false,
                  ...draft.profile,
                  socialLinks: { github: '', linkedin: '', website: '', email: '', ...(draft.profile.socialLinks || {}) },
                });
              }
              // Merge experiences with the server copy so that rows the draft
              // never saw — e.g. proof-of-work submissions made via the dashboard
              // "Nộp minh chứng" form — are not dropped on the next save (which
              // would let the backend delete them as orphaned PENDING rows).
              setExperiences(mergeExperiences(data.experiences || [], draft.experiences));
              if (draft.credentials) {
                setCredentials(mergeCredentials(data.credentials || [], draft.credentials));
              }
              if (draft.avatar) {
                setAvatar(draft.avatar);
              }
              setIsDraftDirty(true);
              draftLoaded = true;
            } catch (err) {
              console.error('Lỗi khi tải bản nháp từ localStorage:', err);
            }
          }

          if (!draftLoaded) {
            if (data.avatar) {
              setAvatar(prev => ({ ...prev, ...data.avatar }));
            }
            setProfile({
              name: data.name || '',
              headline: dbHeadline,
              school: data.school || '',
              location: data.location || '',
              bio: data.bio || '',
              skills: data.skills ? data.skills.join(', ') : '',
              openToWork: !!data.openToWork,
              socialLinks: { github: '', linkedin: '', website: '', email: '', ...(data.socialLinks || {}) },
              coverBannerUrl: data.coverBannerUrl || '',
              coverBannerPos: data.coverBannerPos || '50% 50%',
            });
            if (data.experiences && data.experiences.length > 0) {
              setExperiences(data.experiences);
            }
            if (data.credentials && data.credentials.length > 0) {
              setCredentials(data.credentials);
            }
          }
        }
      } catch (err) {
        console.error('Không thể load portfolio từ backend:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPortfolio();
  }, [navigate, isEditing]);

  // Auto-save form state to localStorage as a draft whenever it changes and is dirty.
  // Base64 images/files are stripped first: they can be several MB and would blow
  // past the ~5MB localStorage quota (which previously threw QuotaExceededError and
  // crashed the page). The draft only needs to preserve unsaved *text* edits — the
  // actual image/file bytes live on the server once the portfolio is saved.
  useEffect(() => {
    if (isLoading || !isDraftDirty) return;

    const draft = {
      profile,
      experiences: experiences.map((exp) => stripKeys(exp, ['proofImages'])),
      credentials: credentials.map((cred) => stripKeys(cred, ['fileData', 'fileType'])),
      avatar,
      savedAt: Date.now(),
    };

    try {
      localStorage.setItem('nextplease:portfolio-draft', JSON.stringify(draft));
    } catch (err) {
      // Quota exceeded or storage unavailable — drop the draft rather than crash.
      // Worst case the user loses local autosave of unsaved edits, not their data.
      console.warn('Không thể lưu bản nháp portfolio vào localStorage:', err);
      try {
        localStorage.removeItem('nextplease:portfolio-draft');
      } catch {
        /* ignore */
      }
    }
  }, [profile, experiences, credentials, avatar, isLoading, isDraftDirty]);

  async function handleSavePortfolio() {
    try {
      setIsSaving(true);
      setErrorMsg('');
      setSuccessMsg('');
      
      const payload = {
        name: profile.name,
        headline: profile.headline,
        school: profile.school,
        location: profile.location,
        bio: profile.bio,
        skills: profile.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
        avatar,
        experiences: experiences.filter(exp => exp.title.trim() || exp.organization.trim()),
        credentials: credentials.filter(cred => cred.name.trim() || cred.issuer.trim()),
        openToWork: !!profile.openToWork,
        socialLinks: profile.socialLinks || {},
        coverBannerUrl: profile.coverBannerUrl || '',
        coverBannerPos: profile.coverBannerPos || '50% 50%',
      };
      
      await updateMyPortfolio(payload);
      setSuccessMsg('Portfolio của bạn đã được lưu chính thức vào hệ thống!');
      setIsSubmittedSuccessfully(true);
      setShowConfirmModal(false);
      localStorage.removeItem('nextplease:portfolio-draft');
      setIsDraftDirty(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Có lỗi xảy ra khi lưu portfolio. Vui lòng thử lại.');
      setShowConfirmModal(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveDraftAndExit() {
    try {
      setIsSaving(true);
      setErrorMsg('');
      setSuccessMsg('');
      
      const payload = {
        name: profile.name,
        headline: profile.headline,
        school: profile.school,
        location: profile.location,
        bio: profile.bio,
        skills: profile.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
        avatar,
        experiences: experiences.filter(exp => exp.title.trim() || exp.organization.trim()),
        credentials: credentials.filter(cred => cred.name.trim() || cred.issuer.trim()),
        openToWork: !!profile.openToWork,
        socialLinks: profile.socialLinks || {},
        coverBannerUrl: profile.coverBannerUrl || '',
        coverBannerPos: profile.coverBannerPos || '50% 50%',
      };
      
      await updateMyPortfolio(payload, true);
      localStorage.removeItem('nextplease:portfolio-draft');
      setIsDraftDirty(false);
      setShowExitWarningModal(false);
      navigate('/');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Có lỗi xảy ra khi lưu bản nháp. Vui lòng thử lại.');
      setShowExitWarningModal(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  }


  function updateAvatar(field, value) {
    markDirty();
    // Chọn linh vật thì ghi luôn giới tính tương ứng, để trường gender còn lại
    // trong dữ liệu không mâu thuẫn với linh vật đang chọn.
    setAvatar((current) => {
      const next = { ...current, [field]: value };
      if (field === 'mascot') {
        const picked = MASCOTS.find((m) => m.id === value);
        if (picked) next.gender = picked.gender;
      }
      return next;
    });
  }

  function updateProfile(event) {
    markDirty();
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function toggleOpenToWork() {
    markDirty();
    setProfile((current) => ({ ...current, openToWork: !current.openToWork }));
  }

  function updateSocialLink(key, value) {
    markDirty();
    setProfile((current) => ({ ...current, socialLinks: { ...current.socialLinks, [key]: value } }));
  }

  function updateExperience(id, field, value) {
    markDirty();
    setExperiences((current) =>
      current.map((experience) =>
        experience.id === id ? { ...experience, [field]: value } : experience,
      ),
    );
    const key = `experience_${id}_${field}`;
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function addExperience() {
    markDirty();
    setExperiences((current) => [
      ...current,
      {
        id: Date.now(),
        title: '',
        organization: '',
        detail: '',
        category: 'CLUB_SMALL',
        roleLevel: 'MEMBER',
        proofLink: '',
        startDate: '',
        endDate: '',
        proofImages: [],
      },
    ]);
  }

  // Proof images for an experience: base64, <2MB each, max 6 — these feed the
  // admin "Hàng chờ xác thực" queue once the portfolio is saved.
  function handleExperienceProofUpload(id, event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    markDirty();
    files.forEach((file) => {
      if (file.size > 2 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onload = () => {
        setExperiences((current) =>
          current.map((exp) =>
            exp.id === id
              ? { ...exp, proofImages: [...(exp.proofImages || []), reader.result].slice(0, 6) }
              : exp,
          ),
        );
      };
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  }

  function removeExperienceProof(id, idx) {
    markDirty();
    setExperiences((current) =>
      current.map((exp) =>
        exp.id === id ? { ...exp, proofImages: (exp.proofImages || []).filter((_, i) => i !== idx) } : exp,
      ),
    );
  }

  function removeExperience(id) {
    markDirty();
    setExperiences((current) => current.filter((exp) => exp.id !== id));
    setErrors((prev) => {
      const next = { ...prev };
      let changed = false;
      Object.keys(next).forEach((key) => {
        if (key.startsWith(`experience_${id}_`)) {
          delete next[key];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }

  function updateCredential(id, field, value) {
    markDirty();
    setCredentials((current) =>
      current.map((credential) =>
        credential.id === id ? { ...credential, [field]: value } : credential,
      ),
    );
    const key = `credential_${id}_${field}`;
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function updateCredentialFile(id, file) {
    if (file && file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        [`credential_${id}_fileName`]: 'File bằng cấp/chứng chỉ không được vượt quá 5MB.',
      }));
      return;
    }
    setErrors((prev) => {
      if (!prev[`credential_${id}_fileName`]) return prev;
      const next = { ...prev };
      delete next[`credential_${id}_fileName`];
      return next;
    });

    if (!file) {
      markDirty();
      setCredentials((current) =>
        current.map((credential) =>
          credential.id === id
            ? { ...credential, fileName: '', fileData: '', fileType: '' }
            : credential,
        ),
      );
      return;
    }

    markDirty();
    const reader = new FileReader();
    reader.onload = () => {
      setCredentials((current) =>
        current.map((credential) =>
          credential.id === id
            ? { ...credential, fileName: file.name, fileData: reader.result, fileType: file.type }
            : credential,
        ),
      );
    };
    reader.readAsDataURL(file);
  }

  function handleIssuedAtChange(id, rawValue) {
    let clean = rawValue.replace(/[^0-9/]/g, '');
    const digits = clean.replace(/\D/g, '');
    if (digits.length > 2) {
      clean = `${digits.substring(0, 2)}/${digits.substring(2, 4)}`;
    } else {
      clean = digits;
    }
    updateCredential(id, 'issuedAt', clean);
  }

  function handleExperienceDateChange(id, field, rawValue) {
    let clean = rawValue.replace(/[^0-9/]/g, '');
    const digits = clean.replace(/\D/g, '');
    if (digits.length > 2) {
      clean = `${digits.substring(0, 2)}/${digits.substring(2, 4)}`;
    } else {
      clean = digits;
    }
    updateExperience(id, field, clean);
  }

  function addCredential() {
    markDirty();
    setCredentials((current) => [
      ...current,
      {
        id: Date.now(),
        name: '',
        issuer: '',
        issuedAt: '',
        fileName: '',
        fileData: '',
        fileType: '',
      },
    ]);
  }

  function removeCredential(id) {
    markDirty();
    setCredentials((current) => current.filter((cred) => cred.id !== id));
    setErrors((prev) => {
      const next = { ...prev };
      let changed = false;
      Object.keys(next).forEach((key) => {
        if (key.startsWith(`credential_${id}_`)) {
          delete next[key];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }

  function validatePortfolio() {
    setErrorMsg('');
    setSuccessMsg('');
    const newErrors = {};

    if (!profile.name.trim()) {
      newErrors.name = 'Vui lòng điền họ và tên.';
    }

    const datePattern = /^(0[1-9]|1[0-2])\/[0-9]{2}$/;
    const currentDate = new Date();
    const currentYear2Digit = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    experiences.forEach((exp) => {
      if (!exp.title.trim()) {
        newErrors[`experience_${exp.id}_title`] = 'Vui lòng nhập vai trò.';
      }
      if (!exp.organization.trim()) {
        newErrors[`experience_${exp.id}_organization`] = 'Vui lòng nhập tổ chức / dự án.';
      }
      if (!exp.detail.trim()) {
        newErrors[`experience_${exp.id}_detail`] = 'Vui lòng nhập mô tả kinh nghiệm.';
      }

      // Start date validation
      if (!exp.startDate?.trim()) {
        newErrors[`experience_${exp.id}_startDate`] = 'Vui lòng nhập thời gian bắt đầu.';
      } else if (!datePattern.test(exp.startDate)) {
        newErrors[`experience_${exp.id}_startDate`] = 'Đúng định dạng MM/YY (ví dụ: 09/24).';
      } else {
        const [startM, startY] = exp.startDate.split('/').map(Number);
        if (startY > currentYear2Digit || (startY === currentYear2Digit && startM > currentMonth)) {
          newErrors[`experience_${exp.id}_startDate`] = `Thời gian bắt đầu không được lớn hơn tháng hiện tại (${String(currentMonth).padStart(2, '0')}/${currentYear2Digit}).`;
        }
      }

      // End date validation
      if (!exp.endDate?.trim()) {
        newErrors[`experience_${exp.id}_endDate`] = 'Vui lòng nhập thời gian kết thúc.';
      } else if (!datePattern.test(exp.endDate)) {
        newErrors[`experience_${exp.id}_endDate`] = 'Đúng định dạng MM/YY (ví dụ: 06/26).';
      } else {
        const [endM, endY] = exp.endDate.split('/').map(Number);
        if (endY > currentYear2Digit || (endY === currentYear2Digit && endM > currentMonth)) {
          newErrors[`experience_${exp.id}_endDate`] = `Thời gian kết thúc không được lớn hơn tháng hiện tại (${String(currentMonth).padStart(2, '0')}/${currentYear2Digit}).`;
        }
      }

      // Compare start and end dates
      if (exp.startDate?.trim() && exp.endDate?.trim() && datePattern.test(exp.startDate) && datePattern.test(exp.endDate)) {
        const [startM, startY] = exp.startDate.split('/').map(Number);
        const [endM, endY] = exp.endDate.split('/').map(Number);
        if (startY > endY || (startY === endY && startM > endM)) {
          newErrors[`experience_${exp.id}_endDate`] = `Thời gian kết thúc không được sớm hơn thời gian bắt đầu (${exp.startDate}).`;
        }
      }
    });

    credentials.forEach((cred) => {
      if (!cred.name.trim()) {
        newErrors[`credential_${cred.id}_name`] = 'Vui lòng nhập tên bằng cấp / chứng chỉ.';
      }
      if (!cred.issuer.trim()) {
        newErrors[`credential_${cred.id}_issuer`] = 'Vui lòng nhập đơn vị cấp.';
      }
      if (!cred.issuedAt?.trim()) {
        newErrors[`credential_${cred.id}_issuedAt`] = 'Vui lòng nhập thời gian cấp.';
      } else if (!datePattern.test(cred.issuedAt)) {
        newErrors[`credential_${cred.id}_issuedAt`] = 'Đúng định dạng MM/YY (ví dụ: 06/26).';
      } else {
        const [issuedM, issuedY] = cred.issuedAt.split('/').map(Number);
        if (issuedY > currentYear2Digit || (issuedY === currentYear2Digit && issuedM > currentMonth)) {
          newErrors[`credential_${cred.id}_issuedAt`] = `Thời gian cấp không được lớn hơn tháng hiện tại (${String(currentMonth).padStart(2, '0')}/${currentYear2Digit}).`;
        }
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => {
        const firstErrorEl = document.querySelector('.input-error');
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstErrorEl.focus();
        }
      }, 50);
      return false;
    }

    return true;
  }

  function handleOpenConfirmModal() {
    if (validatePortfolio()) {
      setShowConfirmModal(true);
    }
  }

  function openPortfolioPreview() {
    const previewId = String(Date.now());
    const previewPayload = {
      avatar,
      profile,
      experiences,
      credentials,
      createdAt: new Date().toISOString(),
    };

    // Each preview holds full base64 images, so stale entries from earlier clicks
    // pile up and eventually blow the localStorage quota. Clear old previews first.
    try {
      for (let i = localStorage.length - 1; i >= 0; i -= 1) {
        const key = localStorage.key(i);
        if (key && key.startsWith(PORTFOLIO_PREVIEW_STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      /* ignore */
    }

    try {
      localStorage.setItem(
        `${PORTFOLIO_PREVIEW_STORAGE_PREFIX}${previewId}`,
        JSON.stringify(previewPayload),
      );
    } catch (err) {
      console.warn('Không thể tạo bản xem trước:', err);
      setErrorMsg('Bản preview quá lớn (quá nhiều ảnh đính kèm) nên không thể mở. Hãy giảm bớt ảnh minh chứng rồi thử lại.');
      return;
    }
    window.open(`/portfolio/preview?draft=${previewId}`, '_blank', 'noopener,noreferrer');
  }

  const skills = profile.skills
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);

  if (isSubmittedSuccessfully) {
    return (
      <section className="portfolio-success-page" style={{
        minHeight: '100dvh',
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        marginTop: '-34px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        boxSizing: 'border-box',
        background: 'var(--portfolio-bg)'
      }}>
        <div className="success-card" style={{
          maxWidth: '560px',
          width: '100%',
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: '24px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: 'var(--shadow)'
        }}>
          <div className="success-icon-wrapper" style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #22c55e, #10b981)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 0 20px rgba(34, 197, 150, 0.4)'
          }}>
            <BadgeCheck size={40} color="#ffffff" />
          </div>
          
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: '800',
            marginBottom: '16px',
            color: 'var(--ink)',
            textAlign: 'center'
          }}>
            {isEditing ? 'Cập Nhật Portfolio Thành Công!' : 'Lưu Portfolio Thành Công!'}
          </h1>
          
          <p style={{
            color: 'var(--muted)',
            lineHeight: '1.6',
            marginBottom: '32px',
            fontSize: '1rem',
            textAlign: 'center'
          }}>
            {isEditing
              ? 'Hồ sơ và Proof of Work của bạn đã được cập nhật thành công trên hệ thống nextplease.'
              : 'Hồ sơ và Proof of Work của bạn đã được ghi nhận chính thức trên hệ thống nextplease. Bạn đã sẵn sàng để khám phá các cơ hội nghề nghiệp.'}
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <Link to="/candidates/dashboard" className="button primary-button" style={{
              justifyContent: 'center',
              padding: '14px',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              {isEditing ? 'Quay lại Dashboard' : 'Đến trang ứng viên'}
            </Link>
            
            {!isEditing && (
              <Link to="/" className="button secondary-button" style={{
                justifyContent: 'center',
                padding: '14px',
                fontSize: '1rem',
                fontWeight: '600'
              }}>
                Về trang chủ
              </Link>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Rời trang dựng portfolio CHỈ là điều hướng, không phải đăng xuất.
  // Ba chỗ thoát ở đây từng gọi supabase.auth.signOut() — di sản từ thời
  // portfolio là bước bắt buộc ngay sau khi đăng ký, nên "thoát" bị hiểu là
  // bỏ dở việc tạo tài khoản. Giờ nó là một trang bình thường, đăng xuất
  // người dùng khi họ bấm "Về trang chủ" là sai.
  const handleExitClick = (e) => {
    if (e) e.preventDefault();
    if (isDraftDirty) {
      setShowExitWarningModal(true);
    } else {
      navigate('/');
    }
  };

  return (
    <section className="portfolio-page">
      {/* Cùng tấm mesh với trang chủ và khu vực ứng viên, cùng mốc tan tính
          bằng px — trình dựng là một biểu mẫu rất dài (~3200px), để mesh loang
          theo % chiều cao khung thì nửa dưới trang toàn màu. Xem HeroMesh. */}
      <div className="pf-bg" aria-hidden="true">
        <div className="pf-bg-inner"><HeroMesh fadeMask={PF_MESH_MASK} /></div>
      </div>

      <div className="portfolio-hero">
        <div>
          {!isEditing && (
            <button
              onClick={handleExitClick}
              className="portfolio-back-link ghost-link-button"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: 0,
                color: 'var(--muted)',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              <ArrowLeft size={17} />
              Về trang chủ
            </button>
          )}
          <h1>Dựng hồ sơ năng lực của bạn.</h1>
          <p>
            Chọn linh vật, nhập thông tin và kinh nghiệm đã được xác thực.
            Mọi thay đổi hiện ngay ở khung xem trước.
          </p>
        </div>
      </div>

      <div className="portfolio-builder">
        <aside className="portfolio-studio">
          <div className="avatar-stage">
            <PortfolioMascot avatar={avatar} size={200} />
          </div>
          {/* Bộ chọn linh vật.
              Trước đây chỗ này là chọn giới tính + màu da + kiểu tóc + phụ kiện
              + dáng đứng, vì nhân vật 3D dựng từng bộ phận nên tuỳ biến được.
              Linh vật là tranh cố định, không có bộ phận nào để đổi, nên chỉ
              còn một việc: chọn một trong bốn. Bày hết cả bốn ra thay vì bắt
              chọn giới tính trước rồi mới thấy hai — bốn cái vừa một hàng, và
              người dùng thấy ngay toàn bộ lựa chọn của mình. */}
          <div className="pf-mascot-picker">
            <span className="pf-mascot-picker-label">Chọn linh vật</span>
            <div className="pf-mascot-row" role="radiogroup" aria-label="Chọn linh vật đại diện">
              {MASCOTS.map((m) => {
                const active = resolveMascot(avatar) === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    className={active ? 'pf-mascot-option active' : 'pf-mascot-option'}
                    onClick={() => updateAvatar('mascot', m.id)}
                  >
                    <span
                      className="pf-mascot-thumb"
                      aria-hidden="true"
                      style={{ backgroundImage: `url(${mascotSheets(m.id).directions})` }}
                    />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="portfolio-preview-card">
            <h2>{profile.name || 'Tên ứng viên'}</h2>
            <p>{profile.headline || 'Headline nghề nghiệp'}</p>
            <div className="preview-meta">
              <span>{profile.school || 'Trường học'}</span>
              <span>{profile.location || 'Địa điểm'}</span>
            </div>
            <div className="skill-cloud">
              {skills.length ? (
                skills.map((skill) => <span key={skill}>{skill}</span>)
              ) : (
                <span>Kỹ năng sẽ hiển thị tại đây</span>
              )}
            </div>
          </div>
        </aside>

        <div className="portfolio-form-panel" style={{ position: 'relative' }}>
          {isLoading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'var(--theme-loading-bg, rgba(255, 255, 255, 0.75))',
              backdropFilter: 'blur(4px)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '24px'
            }}>
              <div style={{
                color: 'var(--primary)',
                fontWeight: 600,
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Sparkles className="animate-spin" size={24} />
                Đang tải dữ liệu portfolio...
              </div>
            </div>
          )}

          {successMsg && (
            <div style={{
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              color: '#22c55e',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <BadgeCheck size={20} />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#ef4444',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚠️ {errorMsg}</span>
            </div>
          )}

          <div className="form-section-heading">
            <UserRound size={22} />
            <div>
              <h2>Thông tin cơ bản</h2>
              <p>Những trường này sẽ tạo phần giới thiệu đầu tiên của portfolio.</p>
            </div>
          </div>

          <div className="portfolio-form-grid">
            <label>
              Họ và tên
              <input
                name="name"
                onChange={updateProfile}
                placeholder="Ví dụ: Nguyễn Minh Anh"
                value={profile.name}
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && (
                <span className="field-error-message">
                  <AlertTriangle size={14} className="flex-shrink-0" />
                  {errors.name}
                </span>
              )}
            </label>
            <label>
              Headline
              <input
                name="headline"
                onChange={updateProfile}
                placeholder="Ví dụ: Event staff lead · Campus marketer"
                value={profile.headline}
              />
            </label>
            <label>
              Trường học
              <input
                name="school"
                onChange={updateProfile}
                placeholder="Ví dụ: Đại học Kinh tế TP.HCM"
                value={profile.school}
              />
            </label>
            <label>
              Khu vực
              <input
                name="location"
                onChange={updateProfile}
                placeholder="Ví dụ: TP.HCM"
                value={profile.location}
              />
            </label>
            <label className="full-field">
              Giới thiệu ngắn
              <textarea
                name="bio"
                onChange={updateProfile}
                placeholder="Viết 2-3 câu về điểm mạnh, phong cách làm việc và loại cơ hội bạn đang tìm kiếm."
                rows="4"
                value={profile.bio}
              />
            </label>
            <label className="full-field">
              Kỹ năng, phân tách bằng dấu phẩy
              <input
                name="skills"
                onChange={updateProfile}
                placeholder="Ví dụ: Event Ops, Social Content, Community, Check-in QR"
                value={profile.skills}
              />
            </label>

            <div className="full-field">
              Ảnh bìa <span style={{ fontWeight: 500, color: 'var(--muted)' }}>(tuỳ chọn)</span>
              <span style={{ display: 'block', fontWeight: 500, fontSize: '0.82rem', color: 'var(--muted)', margin: '2px 0 8px' }}>
                Dải ảnh trên đầu portfolio công khai — cách nhanh nhất để trang của bạn khác với mọi người.
              </span>
              <CoverBannerEditor
                url={profile.coverBannerUrl}
                pos={profile.coverBannerPos}
                onChange={({ url, pos }) =>
                  setProfile((current) => ({ ...current, coverBannerUrl: url, coverBannerPos: pos }))}
              />
            </div>

            <div className="full-field pf-avail-card">
              <div className="pf-avail-text">
                <span className="pf-avail-title"><BriefcaseBusiness size={16} /> Đang tìm việc</span>
                <span className="pf-avail-sub">Hiển thị huy hiệu “Đang tìm việc” trên portfolio công khai để nhà tuyển dụng chú ý.</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={!!profile.openToWork}
                className={`pf-switch ${profile.openToWork ? 'on' : ''}`}
                onClick={toggleOpenToWork}
              >
                <span className="pf-switch-knob" />
              </button>
            </div>

            <label className="full-field">
              Liên kết liên hệ <span style={{ fontWeight: 500, color: 'var(--muted)' }}>(tuỳ chọn)</span>
              <div className="pf-social-inputs">
                {[
                  { key: 'github', icon: Code2, ph: 'github.com/username' },
                  { key: 'linkedin', icon: Link2, ph: 'linkedin.com/in/username' },
                  { key: 'website', icon: Globe, ph: 'website-cua-ban.com' },
                  { key: 'email', icon: Mail, ph: 'email@lienhe.com' },
                ].map((f) => {
                  const Icon = f.icon;
                  return (
                    <div className="pf-social-input" key={f.key}>
                      <Icon size={16} />
                      <input
                        value={(profile.socialLinks && profile.socialLinks[f.key]) || ''}
                        onChange={(e) => updateSocialLink(f.key, e.target.value)}
                        placeholder={f.ph}
                      />
                    </div>
                  );
                })}
              </div>
            </label>
          </div>

          <div className="experience-editor">
            <div className="form-section-heading">
              <BriefcaseBusiness size={22} />
              <div>
                <h2>Kinh nghiệm</h2>
              </div>
            </div>

            {experiences.map((experience, index) => (
              <article className="experience-edit-card" key={experience.id}>
                <div className="edit-card-toolbar">
                  <div className="edit-card-index">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>Kinh nghiệm nổi bật</strong>
                  </div>
                  <button
                    className="edit-card-remove"
                    onClick={() => removeExperience(experience.id)}
                    type="button"
                  >
                    <Trash2 size={14} /> Xoá
                  </button>
                </div>
                <label>
                  Vai trò
                  <input
                    onChange={(event) => updateExperience(experience.id, 'title', event.target.value)}
                    placeholder="Ví dụ: Event Staff Lead"
                    value={experience.title}
                    className={errors[`experience_${experience.id}_title`] ? 'input-error' : ''}
                  />
                  {errors[`experience_${experience.id}_title`] && (
                    <span className="field-error-message">
                      <AlertTriangle size={14} className="flex-shrink-0" />
                      {errors[`experience_${experience.id}_title`]}
                    </span>
                  )}
                </label>
                <label>
                  Tổ chức / dự án
                  <input
                    onChange={(event) =>
                      updateExperience(experience.id, 'organization', event.target.value)
                    }
                    placeholder="Ví dụ: Campus Tech Summit"
                    value={experience.organization}
                    className={errors[`experience_${experience.id}_organization`] ? 'input-error' : ''}
                  />
                  {errors[`experience_${experience.id}_organization`] && (
                    <span className="field-error-message">
                      <AlertTriangle size={14} className="flex-shrink-0" />
                      {errors[`experience_${experience.id}_organization`]}
                    </span>
                  )}
                </label>
                <label className="select-field">
                  <span className="select-field-label">
                    <Award size={14} /> Cấp bậc vai trò
                  </span>
                  <div className="select-shell">
                    <select
                      value={experience.roleLevel || 'MEMBER'}
                      onChange={(event) => updateExperience(experience.id, 'roleLevel', event.target.value)}
                    >
                      {EXPERIENCE_ROLE_LEVEL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="select-chevron" />
                  </div>
                </label>
                <label className="select-field">
                  <span className="select-field-label">
                    <Sparkles size={14} /> Loại hình hoạt động
                  </span>
                  <div className="select-shell">
                    <select
                      value={experience.category || 'CLUB_SMALL'}
                      onChange={(event) => updateExperience(experience.id, 'category', event.target.value)}
                    >
                      {EXPERIENCE_CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="select-chevron" />
                  </div>
                </label>
                <label className="full-field proof-link-field">
                  <span className="select-field-label">
                    <LinkIcon size={14} /> Link minh chứng
                    <em>không bắt buộc</em>
                  </span>
                  <input
                    onChange={(event) => updateExperience(experience.id, 'proofLink', event.target.value)}
                    placeholder="https://drive.google.com/... hoặc link Facebook event"
                    value={experience.proofLink || ''}
                  />
                  <small className="field-hint">Dán link Google Drive, fanpage sự kiện, hoặc ảnh chứng nhận để Admin xác thực nhanh hơn.</small>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <label>
                    Thời gian bắt đầu
                    <input
                      onChange={(event) =>
                        handleExperienceDateChange(experience.id, 'startDate', event.target.value)
                      }
                      placeholder="mm/yy (Ví dụ: 09/24)"
                      value={experience.startDate || ''}
                      className={errors[`experience_${experience.id}_startDate`] ? 'input-error' : ''}
                    />
                    {errors[`experience_${experience.id}_startDate`] && (
                      <span className="field-error-message">
                        <AlertTriangle size={14} className="flex-shrink-0" />
                        {errors[`experience_${experience.id}_startDate`]}
                      </span>
                    )}
                  </label>
                  <label>
                    Thời gian kết thúc
                    <input
                      onChange={(event) =>
                        handleExperienceDateChange(experience.id, 'endDate', event.target.value)
                      }
                      placeholder="mm/yy (Ví dụ: 06/26)"
                      value={experience.endDate || ''}
                      className={errors[`experience_${experience.id}_endDate`] ? 'input-error' : ''}
                    />
                    {errors[`experience_${experience.id}_endDate`] && (
                      <span className="field-error-message">
                        <AlertTriangle size={14} className="flex-shrink-0" />
                        {errors[`experience_${experience.id}_endDate`]}
                      </span>
                    )}
                  </label>
                </div>
                <label className="full-field">
                  Mô tả kinh nghiệm
                  <textarea
                    onChange={(event) => updateExperience(experience.id, 'detail', event.target.value)}
                    placeholder="Mô tả vai trò, kết quả, quy mô sự kiện/dự án và proof có thể xác minh."
                    rows="3"
                    value={experience.detail}
                    className={errors[`experience_${experience.id}_detail`] ? 'input-error' : ''}
                  />
                  {errors[`experience_${experience.id}_detail`] && (
                    <span className="field-error-message">
                      <AlertTriangle size={14} className="flex-shrink-0" />
                      {errors[`experience_${experience.id}_detail`]}
                    </span>
                  )}
                </label>

                {/* Proof images — sent to admin verification queue on save */}
                <label className="full-field">
                  Minh chứng (ảnh, tối đa 6 · ≤ 2MB mỗi ảnh)
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
                    {(experience.proofImages || []).map((img, i) => (
                      <div key={i} style={{ position: 'relative', width: '88px', height: '88px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--c-line, #ece6e2)' }}>
                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => removeExperienceProof(experience.id, i)}
                          aria-label="Xoá ảnh"
                          style={{ position: 'absolute', top: '4px', right: '4px', width: '22px', height: '22px', borderRadius: '50%', border: 'none', background: 'rgba(220,38,38,0.92)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, fontSize: '0.78rem', fontWeight: 800 }}>×</button>
                      </div>
                    ))}
                    {(experience.proofImages || []).length < 6 && (
                      <label style={{ width: '88px', height: '88px', borderRadius: '12px', border: '1.5px dashed var(--c-line, #d6cfca)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer', color: 'var(--c-red, #e5533f)', fontSize: '0.74rem', fontWeight: 700, background: 'rgba(229,83,63,0.04)' }}>
                        <FileUp size={18} /> Tải ảnh
                        <input type="file" accept="image/*" multiple onChange={(e) => handleExperienceProofUpload(experience.id, e)} style={{ display: 'none' }} />
                      </label>
                    )}
                  </div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--c-muted, #8a7f78)', marginTop: '6px', display: 'block' }}>
                    Ảnh minh chứng giúp Admin xác thực kinh nghiệm này trong "Hàng chờ xác thực".
                  </span>
                </label>
              </article>
            ))}

            <button className="button secondary-button add-experience-button" onClick={addExperience} type="button">
              <Plus size={18} />
              Thêm kinh nghiệm
            </button>
          </div>

          <div className="credential-editor">
            <div className="form-section-heading">
              <Award size={22} />
              <div>
                <h2>Bằng cấp & chứng chỉ</h2>
              </div>
            </div>

            {credentials.map((credential, index) => (
              <article className="credential-edit-card" key={credential.id}>
                <div className="edit-card-toolbar">
                  <div className="edit-card-index credential">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>Minh chứng học tập</strong>
                  </div>
                  <button
                    className="edit-card-remove"
                    onClick={() => removeCredential(credential.id)}
                    type="button"
                  >
                    <Trash2 size={14} /> Xoá
                  </button>
                </div>
                <label>
                  Tên bằng cấp / chứng chỉ
                  <input
                    onChange={(event) => updateCredential(credential.id, 'name', event.target.value)}
                    placeholder="Ví dụ: IELTS 7.0 / Google UX Design Certificate"
                    value={credential.name}
                    className={errors[`credential_${credential.id}_name`] ? 'input-error' : ''}
                  />
                  {errors[`credential_${credential.id}_name`] && (
                    <span className="field-error-message">
                      <AlertTriangle size={14} className="flex-shrink-0" />
                      {errors[`credential_${credential.id}_name`]}
                    </span>
                  )}
                </label>
                <label>
                  Đơn vị cấp
                  <input
                    onChange={(event) => updateCredential(credential.id, 'issuer', event.target.value)}
                    placeholder="Ví dụ: British Council / Coursera"
                    value={credential.issuer}
                    className={errors[`credential_${credential.id}_issuer`] ? 'input-error' : ''}
                  />
                  {errors[`credential_${credential.id}_issuer`] && (
                    <span className="field-error-message">
                      <AlertTriangle size={14} className="flex-shrink-0" />
                      {errors[`credential_${credential.id}_issuer`]}
                    </span>
                  )}
                </label>
                <label>
                  Thời gian cấp (MM/YY)
                  <input
                    onChange={(event) => handleIssuedAtChange(credential.id, event.target.value)}
                    placeholder="Ví dụ: 06/26"
                    value={credential.issuedAt}
                    className={errors[`credential_${credential.id}_issuedAt`] ? 'input-error' : ''}
                  />
                  {errors[`credential_${credential.id}_issuedAt`] && (
                    <span className="field-error-message">
                      <AlertTriangle size={14} className="flex-shrink-0" />
                      {errors[`credential_${credential.id}_issuedAt`]}
                    </span>
                  )}
                </label>
                <label className="credential-upload-field">
                  File bằng cấp / chứng chỉ
                  <span className={`upload-dropzone ${errors[`credential_${credential.id}_fileName`] ? 'input-error' : ''}`}>
                    <FileUp size={20} />
                    <span>
                      {credential.fileName || 'Tải lên PDF, PNG hoặc JPG'}
                      <small>Yêu cầu dung lượng dưới 5MB.</small>
                    </span>
                    <input
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(event) => updateCredentialFile(credential.id, event.target.files?.[0])}
                      type="file"
                    />
                  </span>
                  {errors[`credential_${credential.id}_fileName`] && (
                    <span className="field-error-message">
                      <AlertTriangle size={14} className="flex-shrink-0" />
                      {errors[`credential_${credential.id}_fileName`]}
                    </span>
                  )}
                </label>
              </article>
            ))}

            <button className="button secondary-button add-experience-button" onClick={addCredential} type="button">
              <Plus size={18} />
              Thêm chứng chỉ
            </button>
          </div>

          <div className="portfolio-preview-action-panel">
            <div className="form-section-heading">
              <Eye size={22} />
              <div>
                <h2>Xem trước Portfolio</h2>
                <p>
                  Mở một tab riêng để kiểm tra cách hồ sơ, linh vật, kinh nghiệm và chứng chỉ đang hiển thị.
                </p>
              </div>
            </div>
            <button className="button secondary-button preview-open-button" onClick={openPortfolioPreview} type="button">
              <Eye size={18} />
              Xem trước
            </button>
          </div>

          <div className="portfolio-submit-panel">
            <div>
              <span>Hoàn tất Portfolio</span>
              <h2>Sẵn sàng lưu hồ sơ của bạn?</h2>
              <p>Kiểm tra lại thông tin lần cuối, sau đó gửi để lưu Portfolio vào hệ thống nextplease.</p>
            </div>
            <button className="button primary-button ready-submit-button" onClick={handleOpenConfirmModal} type="button">
              <Sparkles size={18} />
              Tôi đã sẵn sàng
            </button>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="confirm-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <h2>Xác nhận gửi Portfolio</h2>
              <button
                className="close-button"
                onClick={() => setShowConfirmModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--ink)',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                &times;
              </button>
            </div>
            <div className="confirm-modal-body">
              <div className="confirm-avatar-container">
                <div className="confirm-avatar-box">
                  <PortfolioMascot avatar={avatar} size={200} />
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)', textAlign: 'center' }}>
                  Linh vật đại diện cho hồ sơ ứng tuyển của bạn.
                </p>
              </div>
              <div className="confirm-details-container">
                <div className="confirm-section">
                  <h3>Thông tin cá nhân</h3>
                  <div className="confirm-grid">
                    <span className="confirm-label">Họ và tên:</span>
                    <span className="confirm-field">{profile.name}</span>
                    <span className="confirm-label">Headline:</span>
                    <span className="confirm-field">{profile.headline || <em style={{ color: 'var(--ink-muted)' }}>Chưa điền</em>}</span>
                    <span className="confirm-label">Trường học:</span>
                    <span className="confirm-field">{profile.school || <em style={{ color: 'var(--ink-muted)' }}>Chưa điền</em>}</span>
                    <span className="confirm-label">Địa điểm:</span>
                    <span className="confirm-field">{profile.location || <em style={{ color: 'var(--ink-muted)' }}>Chưa điền</em>}</span>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <span className="confirm-label" style={{ display: 'block', marginBottom: '4px' }}>Giới thiệu bản thân:</span>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--ink)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                      {profile.bio || <em style={{ color: 'var(--ink-muted)' }}>Chưa điền giới thiệu.</em>}
                    </p>
                  </div>
                </div>

                <div className="confirm-section">
                  <h3>Kỹ năng & Chuyên môn</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {skills.length > 0 ? (
                      skills.map((skill, index) => (
                        <span className="confirm-tag" key={index}>{skill}</span>
                      ))
                    ) : (
                      <span className="confirm-field" style={{ color: 'var(--ink-muted)' }}>Chưa có kỹ năng.</span>
                    )}
                  </div>
                </div>

                <div className="confirm-section">
                  <h3>Kinh nghiệm làm việc</h3>
                  {experiences.filter(exp => exp.title.trim() || exp.organization.trim()).length > 0 ? (
                    experiences.filter(exp => exp.title.trim() || exp.organization.trim()).map((exp, index) => (
                      <div className="confirm-list-item" key={exp.id || index}>
                        <strong>{exp.title}</strong> tại <em>{exp.organization}</em> {exp.startDate || exp.endDate ? `(${exp.startDate || '?'}${exp.endDate ? ` - ${exp.endDate}` : ''})` : ''}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                          {EXPERIENCE_CATEGORY_OPTIONS.find(o => o.value === exp.category) && (
                            <span className="confirm-tag">{EXPERIENCE_CATEGORY_OPTIONS.find(o => o.value === exp.category).label.replace(/ \(\+.*$/, '')}</span>
                          )}
                          {EXPERIENCE_ROLE_LEVEL_OPTIONS.find(o => o.value === exp.roleLevel) && (
                            <span className="confirm-tag">{EXPERIENCE_ROLE_LEVEL_OPTIONS.find(o => o.value === exp.roleLevel).label.replace(/ \(\+.*$/, '')}</span>
                          )}
                        </div>
                        {exp.detail && <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--ink-muted)' }}>{exp.detail}</p>}
                        {exp.proofLink && (
                          <a href={exp.proofLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '0.82rem', color: 'var(--primary)' }}>
                            <FileUp size={13} /> Link minh chứng
                          </a>
                        )}
                        {(exp.proofImages || []).length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                            {exp.proofImages.map((img, i) => (
                              <button key={i} type="button" onClick={() => setFilePreview({ src: img, fileName: `Minh chứng ${i + 1}` })} style={{ display: 'block', padding: 0, width: '72px', height: '72px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--c-line, #ece6e2)', cursor: 'pointer', background: 'none' }}>
                                <img src={img} alt="Ảnh minh chứng" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <span className="confirm-field" style={{ color: 'var(--ink-muted)' }}>Chưa có kinh nghiệm làm việc.</span>
                  )}
                </div>

                <div className="confirm-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                  <h3>Bằng cấp & Chứng chỉ</h3>
                  {credentials.filter(cred => cred.name.trim() || cred.issuer.trim()).length > 0 ? (
                    credentials.filter(cred => cred.name.trim() || cred.issuer.trim()).map((cred, index) => (
                      <div className="confirm-list-item" key={cred.id || index}>
                        <strong>{cred.name}</strong> cấp bởi <em>{cred.issuer}</em> {cred.issuedAt ? `(${cred.issuedAt})` : ''}
                        {cred.fileName && (
                          cred.fileData ? (
                            <button type="button" onClick={() => setFilePreview({ src: cred.fileData, fileName: cred.fileName })} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'underline', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                              <BadgeCheck size={14} /> Xem file: {cred.fileName}
                            </button>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.85rem', color: 'var(--primary)' }}>
                              <BadgeCheck size={14} /> File: {cred.fileName}
                            </div>
                          )
                        )}
                        {cred.fileData && /^data:image\//.test(cred.fileData) && (
                          <button type="button" onClick={() => setFilePreview({ src: cred.fileData, fileName: cred.fileName })} style={{ display: 'block', width: '120px', marginTop: '8px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--c-line, #ece6e2)', padding: 0, cursor: 'pointer', background: 'none' }}>
                            <img src={cred.fileData} alt={cred.fileName} style={{ width: '100%', display: 'block' }} />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <span className="confirm-field" style={{ color: 'var(--ink-muted)' }}>Chưa có chứng chỉ.</span>
                  )}
                </div>
              </div>
            </div>
            <div className="confirm-modal-footer">
              <button className="button secondary-button" onClick={() => setShowConfirmModal(false)} type="button">
                Hủy bỏ
              </button>
              <button className="button primary-button" onClick={handleSavePortfolio} type="button" disabled={isSaving}>
                {isSaving ? 'Đang lưu...' : 'Xác nhận & Gửi đi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showExitWarningModal && (
        <div className="confirm-overlay" onClick={() => setShowExitWarningModal(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', borderRadius: '24px' }}>
            <div className="confirm-modal-header" style={{ borderBottom: 'none', padding: '24px 32px 12px' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f59e0b', fontSize: '1.4rem' }}>
                <AlertTriangle size={24} />
                Bạn chưa lưu thay đổi!
              </h2>
              <button
                className="close-button"
                onClick={() => setShowExitWarningModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--ink)',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1
                }}
              >
                &times;
              </button>
            </div>
            <div className="confirm-modal-body" style={{ display: 'block', padding: '12px 32px 24px' }}>
              <p style={{ color: 'var(--muted)', lineHeight: '1.6', fontSize: '1.05rem', margin: 0 }}>
                Bạn chưa hoàn tất gửi thông tin Portfolio lên hệ thống. Bạn có muốn lưu lại những thông tin đã nhập trên trình duyệt để lần sau hoàn thiện tiếp không?
              </p>
            </div>
            <div className="confirm-modal-footer" style={{ borderTop: 'none', padding: '12px 32px 32px', display: 'flex', gap: '12px', flexDirection: 'column' }}>
              <button
                className="button primary-button"
                onClick={handleSaveDraftAndExit}
                type="button"
                style={{ width: '100%', justifyContent: 'center', margin: 0, padding: '14px', fontSize: '1rem', fontWeight: '600', borderRadius: '12px' }}
                disabled={isSaving}
              >
                {isSaving ? 'Đang lưu nháp...' : 'Lưu nháp và Thoát'}
              </button>
              <button
                className="button secondary-button"
                onClick={() => {
                  localStorage.removeItem('nextplease:portfolio-draft');
                  setIsDraftDirty(false);
                  setShowExitWarningModal(false);
                  navigate('/');
                }}
                type="button"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  margin: 0,
                  padding: '14px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  borderRadius: '12px',
                  borderColor: '#dc2626',
                  color: '#dc2626',
                  background: 'rgba(220, 38, 38, 0.05)',
                  transition: 'all 0.2s ease'
                }}
              >
                Không lưu và Thoát
              </button>
              <button
                className="text-link"
                onClick={() => setShowExitWarningModal(false)}
                type="button"
                style={{
                  alignSelf: 'center',
                  marginTop: '8px',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  color: 'var(--muted)',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  textDecoration: 'underline'
                }}
              >
                Ở lại tiếp tục chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {filePreview && (
        <FilePreviewModal
          src={filePreview.src}
          fileName={filePreview.fileName}
          onClose={() => setFilePreview(null)}
        />
      )}
    </section>
  );
}
