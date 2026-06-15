import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
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
} from 'lucide-react';
import { getMyPortfolio, updateMyPortfolio } from '../api/portfolioApi.js';
import { supabase } from '../services/supabaseClient.js';

export const PORTFOLIO_PREVIEW_STORAGE_PREFIX = 'nextplease:portfolio-preview:';

const avatarStyles = {
  female: {
    label: 'Nữ',
    hair: '#2d1b16',
    outfit: '#2563eb',
    accent: '#f97316',
    bodyScale: [0.9, 1.08, 0.72],
    shoulder: 1.25,
  },
  male: {
    label: 'Nam',
    hair: '#1f2937',
    outfit: '#0f172a',
    accent: '#2563eb',
    bodyScale: [1, 1.05, 0.78],
    shoulder: 1.45,
  },
};

const skinToneOptions = [
  { label: 'Sáng', value: '#f4c9a9' },
  { label: 'Tự nhiên', value: '#dca77f' },
  { label: 'Ấm', value: '#b97855' },
  { label: 'Nâu', value: '#8d5a43' },
];

const hairStyleOptions = {
  female: [
    { label: 'Bob', value: 'bob' },
    { label: 'Dài layer', value: 'layered' },
    { label: 'Buộc cao', value: 'ponytail' },
  ],
  male: [
    { label: 'Side part', value: 'sidePart' },
    { label: 'Textured', value: 'textured' },
    { label: 'Undercut', value: 'undercut' },
  ],
};

const accessoryOptions = [
  { label: 'Không kính', value: 'none' },
  { label: 'Mắt kính', value: 'glasses' },
];

const poseOptions = [
  { label: 'Tự tin', value: 'confident' },
  { label: 'Chào cơ hội', value: 'wave' },
];

const defaultExperiences = [
  {
    id: 1,
    title: '',
    organization: '',
    detail: '',
    startDate: '',
    endDate: '',
  },
];

const defaultAvatar = {
  gender: 'female',
  skinTone: skinToneOptions[0].value,
  hairStyle: hairStyleOptions.female[0].value,
  accessory: 'none',
  pose: 'confident',
};

const defaultCredentials = [
  {
    id: 1,
    name: '',
    issuer: '',
    issuedAt: '',
    fileName: '',
  },
];

function addMesh(parent, geometry, material, position, scale = [1, 1, 1], rotation = [0, 0, 0]) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addHairStyle(avatarGroup, hairMaterial, gender, hairStyle) {
  addMesh(avatarGroup, new THREE.SphereGeometry(0.6, 48, 24), hairMaterial, [0, 2.58, -0.05], [1.04, 0.58, 0.98]);

  if (gender === 'female' && hairStyle === 'layered') {
    addMesh(avatarGroup, new THREE.CapsuleGeometry(0.18, 1.15, 14, 28), hairMaterial, [-0.48, 2.04, -0.05], [1, 1, 0.72], [0.02, 0, 0.06]);
    addMesh(avatarGroup, new THREE.CapsuleGeometry(0.18, 1.15, 14, 28), hairMaterial, [0.48, 2.04, -0.05], [1, 1, 0.72], [0.02, 0, -0.06]);
    addMesh(avatarGroup, new THREE.SphereGeometry(0.18, 24, 16), hairMaterial, [0.34, 2.48, 0.34], [1.35, 0.52, 0.55], [0, 0, -0.25]);
    return;
  }

  if (gender === 'female' && hairStyle === 'ponytail') {
    addMesh(avatarGroup, new THREE.SphereGeometry(0.28, 32, 20), hairMaterial, [0, 2.37, -0.56], [0.82, 1.15, 0.72]);
    addMesh(avatarGroup, new THREE.CapsuleGeometry(0.13, 0.86, 12, 24), hairMaterial, [0, 1.92, -0.62], [1, 1, 0.72], [0.08, 0, 0]);
    addMesh(avatarGroup, new THREE.SphereGeometry(0.16, 24, 16), hairMaterial, [-0.32, 2.56, 0.34], [1.3, 0.48, 0.55], [0, 0, 0.25]);
    return;
  }

  if (gender === 'male' && hairStyle === 'textured') {
    [-0.34, -0.12, 0.1, 0.32].forEach((x, index) => {
      addMesh(avatarGroup, new THREE.ConeGeometry(0.13, 0.28, 18), hairMaterial, [x, 2.9, 0.12], [1, 1, 0.8], [0.24, 0, (index - 1.5) * 0.16]);
    });
    return;
  }

  if (gender === 'male' && hairStyle === 'undercut') {
    addMesh(avatarGroup, new THREE.BoxGeometry(0.78, 0.18, 0.58), hairMaterial, [0.04, 2.74, 0.03], [1, 1, 1], [0, 0, -0.08]);
    addMesh(avatarGroup, new THREE.SphereGeometry(0.5, 32, 18), hairMaterial, [0, 2.58, -0.12], [1, 0.34, 0.92]);
    return;
  }

  addMesh(avatarGroup, new THREE.SphereGeometry(0.2, 28, 18), hairMaterial, [-0.28, 2.63, 0.35], [1.45, 0.44, 0.58], [0, 0, 0.22]);
  addMesh(avatarGroup, new THREE.SphereGeometry(0.2, 28, 18), hairMaterial, [0.22, 2.66, 0.34], [1.6, 0.42, 0.58], [0, 0, -0.18]);
}

function addGlasses(avatarGroup, frameMaterial) {
  addMesh(avatarGroup, new THREE.TorusGeometry(0.16, 0.012, 8, 36), frameMaterial, [-0.2, 2.39, 0.51], [1.04, 0.72, 1], [0, 0, 0]);
  addMesh(avatarGroup, new THREE.TorusGeometry(0.16, 0.012, 8, 36), frameMaterial, [0.2, 2.39, 0.51], [1.04, 0.72, 1], [0, 0, 0]);
  addMesh(avatarGroup, new THREE.BoxGeometry(0.12, 0.025, 0.018), frameMaterial, [0, 2.39, 0.51]);
  addMesh(avatarGroup, new THREE.BoxGeometry(0.19, 0.018, 0.018), frameMaterial, [-0.42, 2.4, 0.49], [1, 1, 1], [0, 0.25, 0.02]);
  addMesh(avatarGroup, new THREE.BoxGeometry(0.19, 0.018, 0.018), frameMaterial, [0.42, 2.4, 0.49], [1, 1, 1], [0, -0.25, -0.02]);
}

export function PortfolioAvatar3D({ avatar = defaultAvatar, gender }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const avatarConfig = {
      ...defaultAvatar,
      ...(gender ? { gender } : {}),
      ...avatar,
    };
    const style = avatarStyles[avatarConfig.gender] || avatarStyles.female;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 1.65, 6.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const avatarGroup = new THREE.Group();
    avatarGroup.position.y = -0.55;
    scene.add(avatarGroup);

    const skin = new THREE.MeshStandardMaterial({ color: avatarConfig.skinTone, roughness: 0.5 });
    const hair = new THREE.MeshStandardMaterial({ color: style.hair, roughness: 0.75 });
    const outfit = new THREE.MeshStandardMaterial({ color: style.outfit, roughness: 0.48, metalness: 0.04 });
    const accent = new THREE.MeshStandardMaterial({
      color: style.accent,
      roughness: 0.42,
      metalness: 0.12,
    });
    const white = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.5 });
    const dark = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.66 });
    const lip = new THREE.MeshStandardMaterial({ color: '#9f4d4f', roughness: 0.6 });
    const cheek = new THREE.MeshStandardMaterial({ color: '#e98a7a', roughness: 0.7, transparent: true, opacity: 0.55 });
    const lens = new THREE.MeshStandardMaterial({ color: '#dbeafe', roughness: 0.18, metalness: 0.04, transparent: true, opacity: 0.28 });

    addMesh(avatarGroup, new THREE.CapsuleGeometry(0.18, 0.3, 12, 24), skin, [0, 1.9, 0]);
    addMesh(avatarGroup, new THREE.SphereGeometry(0.54, 64, 48), skin, [0, 2.36, 0], [0.92, 1.05, 0.9]);
    addMesh(avatarGroup, new THREE.SphereGeometry(0.06, 20, 16), skin, [-0.52, 2.34, 0.03], [0.75, 1.15, 0.5]);
    addMesh(avatarGroup, new THREE.SphereGeometry(0.06, 20, 16), skin, [0.52, 2.34, 0.03], [0.75, 1.15, 0.5]);
    addHairStyle(avatarGroup, hair, avatarConfig.gender, avatarConfig.hairStyle);
    addMesh(avatarGroup, new THREE.SphereGeometry(0.065, 18, 18), dark, [-0.19, 2.38, 0.48]);
    addMesh(avatarGroup, new THREE.SphereGeometry(0.065, 18, 18), dark, [0.19, 2.38, 0.48]);
    addMesh(avatarGroup, new THREE.BoxGeometry(0.18, 0.025, 0.028), dark, [-0.19, 2.52, 0.5], [1, 1, 1], [0, 0, -0.08]);
    addMesh(avatarGroup, new THREE.BoxGeometry(0.18, 0.025, 0.028), dark, [0.19, 2.52, 0.5], [1, 1, 1], [0, 0, 0.08]);
    addMesh(avatarGroup, new THREE.ConeGeometry(0.065, 0.18, 24), skin, [0, 2.31, 0.55], [0.65, 1, 0.7], [Math.PI / 2, 0, 0]);
    addMesh(avatarGroup, new THREE.SphereGeometry(0.055, 18, 12), cheek, [-0.32, 2.28, 0.49], [1.2, 0.55, 0.35]);
    addMesh(avatarGroup, new THREE.SphereGeometry(0.055, 18, 12), cheek, [0.32, 2.28, 0.49], [1.2, 0.55, 0.35]);
    addMesh(avatarGroup, new THREE.BoxGeometry(0.26, 0.04, 0.035), lip, [0, 2.14, 0.5]);
    if (avatarConfig.accessory === 'glasses') {
      addMesh(avatarGroup, new THREE.SphereGeometry(0.13, 24, 16), lens, [-0.2, 2.39, 0.51], [1, 0.72, 0.08]);
      addMesh(avatarGroup, new THREE.SphereGeometry(0.13, 24, 16), lens, [0.2, 2.39, 0.51], [1, 0.72, 0.08]);
      addGlasses(avatarGroup, dark);
    }
    addMesh(avatarGroup, new THREE.CapsuleGeometry(0.54, 1.1, 16, 32), outfit, [0, 1.32, 0], style.bodyScale);
    addMesh(avatarGroup, new THREE.CapsuleGeometry(0.38, 0.22, 12, 24), white, [0, 1.78, 0.36], [1, 0.46, 0.25]);
    const leftArmRotation = avatarConfig.pose === 'wave' ? [0.15, 0, -1.02] : [0, 0, -0.38];
    const rightArmRotation = avatarConfig.pose === 'wave' ? [-0.2, 0, 0.18] : [0, 0, 0.38];
    const leftArmPosition = avatarConfig.pose === 'wave' ? [-0.86, 1.7, 0.03] : [-0.76, 1.42, 0];
    const rightArmPosition = avatarConfig.pose === 'wave' ? [0.88, 1.54, 0.02] : [0.76, 1.42, 0];
    addMesh(avatarGroup, new THREE.CapsuleGeometry(0.13, style.shoulder, 12, 24), outfit, leftArmPosition, [1, 1, 1], leftArmRotation);
    addMesh(avatarGroup, new THREE.CapsuleGeometry(0.13, style.shoulder, 12, 24), outfit, rightArmPosition, [1, 1, 1], rightArmRotation);
    if (avatarConfig.pose === 'wave') {
      addMesh(avatarGroup, new THREE.CapsuleGeometry(0.12, 0.58, 12, 24), skin, [-1.25, 2.08, 0.04], [1, 1, 1], [0.18, 0, -0.55]);
      addMesh(avatarGroup, new THREE.SphereGeometry(0.14, 24, 18), skin, [-1.42, 2.36, 0.05], [0.9, 1.1, 0.76]);
    } else {
      addMesh(avatarGroup, new THREE.SphereGeometry(0.13, 24, 18), skin, [-1.02, 1.0, 0.02], [0.9, 1.1, 0.76]);
      addMesh(avatarGroup, new THREE.SphereGeometry(0.13, 24, 18), skin, [1.02, 1.0, 0.02], [0.9, 1.1, 0.76]);
    }
    addMesh(avatarGroup, new THREE.CapsuleGeometry(0.16, 0.92, 12, 24), dark, [-0.28, 0.2, 0], [1, 1, 1], [0.08, 0, 0.08]);
    addMesh(avatarGroup, new THREE.CapsuleGeometry(0.16, 0.92, 12, 24), dark, [0.28, 0.2, 0], [1, 1, 1], [0.08, 0, -0.08]);
    addMesh(avatarGroup, new THREE.TorusGeometry(0.72, 0.018, 12, 96), accent, [0, 1.9, 0.04], [1, 1, 1], [Math.PI / 2, 0, 0]);
    addMesh(avatarGroup, new THREE.BoxGeometry(0.95, 0.12, 0.18), white, [0, 0.9, 0.5]);

    const base = addMesh(
      scene,
      new THREE.CylinderGeometry(1.7, 1.92, 0.18, 96),
      new THREE.MeshStandardMaterial({ color: '#eaf1ff', roughness: 0.55 }),
      [0, -0.68, 0],
    );
    base.receiveShadow = true;

    const ring = addMesh(
      scene,
      new THREE.TorusGeometry(1.72, 0.018, 12, 120),
      accent,
      [0, -0.55, 0],
      [1, 1, 1],
      [Math.PI / 2, 0, 0],
    );
    ring.castShadow = false;

    scene.add(new THREE.HemisphereLight('#f8fbff', '#9fb1ca', 1.65));
    const keyLight = new THREE.DirectionalLight('#ffffff', 2.4);
    keyLight.position.set(3.5, 5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(style.accent, 2.1, 8);
    fillLight.position.set(-3, 2.2, 3);
    scene.add(fillLight);

    const clock = new THREE.Clock();
    let frameId = 0;

    function resize() {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    function animate() {
      const elapsed = clock.getElapsedTime();
      avatarGroup.rotation.y = Math.sin(elapsed * 0.55) * 0.22;
      avatarGroup.position.y = -0.55 + Math.sin(elapsed * 1.2) * 0.04;
      ring.rotation.z = elapsed * 0.42;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      renderer.dispose();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [avatar, gender]);

  return <div className="portfolio-avatar-canvas" ref={mountRef} aria-label="3D portfolio avatar preview" />;
}

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
  });
  const [experiences, setExperiences] = useState(defaultExperiences);
  const [credentials, setCredentials] = useState(defaultCredentials);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
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
                setProfile(draft.profile);
              }
              if (draft.experiences) {
                setExperiences(draft.experiences);
              }
              if (draft.credentials) {
                setCredentials(draft.credentials);
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

  // Auto-save form state to localStorage as a draft whenever it changes and is dirty
  useEffect(() => {
    if (isLoading || !isDraftDirty) return;

    const draft = {
      profile,
      experiences,
      credentials,
      avatar,
      savedAt: Date.now()
    };
    localStorage.setItem('nextplease:portfolio-draft', JSON.stringify(draft));
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
      };
      
      await updateMyPortfolio(payload, true);
      localStorage.removeItem('nextplease:portfolio-draft');
      setIsDraftDirty(false);
      setShowExitWarningModal(false);
      if (supabase) {
        await supabase.auth.signOut();
      }
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
    setAvatar((current) => {
      const nextAvatar = { ...current, [field]: value };
      if (field === 'gender') {
        nextAvatar.hairStyle = hairStyleOptions[value][0].value;
      }
      return nextAvatar;
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
        startDate: '',
        endDate: '',
      },
    ]);
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
    updateCredential(id, 'fileName', file?.name || '');
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

    localStorage.setItem(
      `${PORTFOLIO_PREVIEW_STORAGE_PREFIX}${previewId}`,
      JSON.stringify(previewPayload),
    );
    window.open(`/portfolio/preview?draft=${previewId}`, '_blank', 'noopener,noreferrer');
  }

  const skills = profile.skills
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);

  if (isSubmittedSuccessfully) {
    return (
      <section className="portfolio-success-page" style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
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
              ? 'Hồ sơ 3D và Proof of Work của bạn đã được cập nhật thành công trên hệ thống nextplease.'
              : 'Hồ sơ 3D và Proof of Work của bạn đã được ghi nhận chính thức trên hệ thống nextplease. Bạn đã sẵn sàng để khám phá các cơ hội nghề nghiệp.'}
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

  const handleExitClick = async (e) => {
    if (e) e.preventDefault();
    if (isDraftDirty) {
      setShowExitWarningModal(true);
    } else {
      if (supabase) {
        try {
          await supabase.auth.signOut();
        } catch (err) {
          console.error('Lỗi khi đăng xuất:', err);
        }
      }
      navigate('/');
    }
  };

  return (
    <section className="portfolio-page">
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
          <p className="eyebrow">3D candidate portfolio</p>
          <h1>Tạo Portfolio ứng viên bằng nhân vật 3D của riêng bạn.</h1>
          <p>
            Thay vì bắt đầu bằng form đăng ký khô khan, ứng viên có thể dựng
            một reputation passport sống động: chọn nhân vật, nhập thông tin
            cơ bản, kỹ năng và kinh nghiệm nổi bật.
          </p>
        </div>
      </div>

      <div className="portfolio-builder">
        <aside className="portfolio-studio">
          <div className="avatar-stage">
            <PortfolioAvatar3D avatar={avatar} />
          </div>
          <div className="gender-picker" aria-label="Chọn giới tính nhân vật">
            {Object.entries(avatarStyles).map(([key, value]) => (
              <button
                className={avatar.gender === key ? 'gender-option active' : 'gender-option'}
                key={key}
                onClick={() => updateAvatar('gender', key)}
                type="button"
              >
                {value.label}
              </button>
            ))}
          </div>
          <div className="avatar-customizer">
            <div className="avatar-control-group">
              <span>Màu da</span>
              <div className="skin-tone-row">
                {skinToneOptions.map((skinTone) => (
                  <button
                    aria-label={`Chọn màu da ${skinTone.label}`}
                    className={avatar.skinTone === skinTone.value ? 'skin-tone active' : 'skin-tone'}
                    key={skinTone.value}
                    onClick={() => updateAvatar('skinTone', skinTone.value)}
                    style={{ '--skin-tone': skinTone.value }}
                    type="button"
                  />
                ))}
              </div>
            </div>

            <div className="avatar-control-group">
              <span>Kiểu tóc</span>
              <div className="avatar-option-row">
                {hairStyleOptions[avatar.gender].map((hairStyle) => (
                  <button
                    className={avatar.hairStyle === hairStyle.value ? 'avatar-chip active' : 'avatar-chip'}
                    key={hairStyle.value}
                    onClick={() => updateAvatar('hairStyle', hairStyle.value)}
                    type="button"
                  >
                    {hairStyle.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="avatar-control-grid">
              <div className="avatar-control-group">
                <span>Phụ kiện</span>
                <div className="avatar-option-row compact">
                  {accessoryOptions.map((accessory) => (
                    <button
                      className={avatar.accessory === accessory.value ? 'avatar-chip active' : 'avatar-chip'}
                      key={accessory.value}
                      onClick={() => updateAvatar('accessory', accessory.value)}
                      type="button"
                    >
                      {accessory.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="avatar-control-group">
                <span>Pose</span>
                <div className="avatar-option-row compact">
                  {poseOptions.map((pose) => (
                    <button
                      className={avatar.pose === pose.value ? 'avatar-chip active' : 'avatar-chip'}
                      key={pose.value}
                      onClick={() => updateAvatar('pose', pose.value)}
                      type="button"
                    >
                      {pose.label}
                    </button>
                  ))}
                </div>
              </div>
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
                  Mở một tab riêng để kiểm tra cách hồ sơ, nhân vật 3D, kinh nghiệm và chứng chỉ đang hiển thị.
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
                  <PortfolioAvatar3D avatar={avatar} />
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)', textAlign: 'center' }}>
                  Nhân vật 3D đại diện cho hồ sơ ứng tuyển của bạn.
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
                        {exp.detail && <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--ink-muted)' }}>{exp.detail}</p>}
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.85rem', color: 'var(--primary)' }}>
                            <BadgeCheck size={14} /> File: {cred.fileName}
                          </div>
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
                onClick={async () => {
                  localStorage.removeItem('nextplease:portfolio-draft');
                  setIsDraftDirty(false);
                  setShowExitWarningModal(false);
                  if (supabase) {
                    try {
                      await supabase.auth.signOut();
                    } catch (err) {
                      console.error('Lỗi khi đăng xuất:', err);
                    }
                  }
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
    </section>
  );
}
