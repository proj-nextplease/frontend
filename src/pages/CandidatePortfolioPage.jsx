import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import { getMyPortfolio, updateMyPortfolio } from '../api/portfolioApi.js';

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

export function CandidatePortfolioPage() {
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

  useEffect(() => {
    async function loadPortfolio() {
      try {
        setIsLoading(true);
        const data = await getMyPortfolio();
        if (data) {
          if (data.avatar) {
            setAvatar(prev => ({ ...prev, ...data.avatar }));
          }
          setProfile({
            name: data.name || '',
            headline: data.headline || '',
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
      } catch (err) {
        console.error('Không thể load portfolio từ backend:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPortfolio();
  }, []);

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

  function updateAvatar(field, value) {
    setAvatar((current) => {
      const nextAvatar = { ...current, [field]: value };
      if (field === 'gender') {
        nextAvatar.hairStyle = hairStyleOptions[value][0].value;
      }
      return nextAvatar;
    });
  }

  function updateProfile(event) {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  }

  function updateExperience(id, field, value) {
    setExperiences((current) =>
      current.map((experience) =>
        experience.id === id ? { ...experience, [field]: value } : experience,
      ),
    );
  }

  function addExperience() {
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
    setExperiences((current) => current.filter((exp) => exp.id !== id));
  }

  function updateCredential(id, field, value) {
    setCredentials((current) =>
      current.map((credential) =>
        credential.id === id ? { ...credential, [field]: value } : credential,
      ),
    );
  }

  function updateCredentialFile(id, file) {
    if (file && file.size > 5 * 1024 * 1024) {
      setErrorMsg('File bằng cấp/chứng chỉ không được vượt quá 5MB.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
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
    setCredentials((current) => current.filter((cred) => cred.id !== id));
  }

  function validatePortfolio() {
    setErrorMsg('');
    setSuccessMsg('');

    if (!profile.name.trim()) {
      setErrorMsg('Vui lòng điền họ và tên.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    const datePattern = /^(0[1-9]|1[0-2])\/[0-9]{2}$/;

    for (let i = 0; i < experiences.length; i++) {
      const exp = experiences[i];
      if (!exp.title.trim() || !exp.organization.trim() || !exp.detail.trim() || !exp.startDate?.trim() || !exp.endDate?.trim()) {
        setErrorMsg(`Vui lòng nhập đầy đủ thông tin (Vai trò, Tổ chức, Mô tả, Thời gian bắt đầu/kết thúc) cho kinh nghiệm #${i + 1}.`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return false;
      }

      if (!datePattern.test(exp.startDate)) {
        setErrorMsg(`Thời gian bắt đầu của kinh nghiệm #${i + 1} phải đúng định dạng MM/YY (ví dụ: 09/24).`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return false;
      }

      if (!datePattern.test(exp.endDate)) {
        setErrorMsg(`Thời gian kết thúc của kinh nghiệm #${i + 1} phải đúng định dạng MM/YY (ví dụ: 06/26).`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return false;
      }

      const [startM, startY] = exp.startDate.split('/').map(Number);
      const [endM, endY] = exp.endDate.split('/').map(Number);
      if (startY > endY || (startY === endY && startM > endM)) {
        setErrorMsg(`Kinh nghiệm #${i + 1} có thời gian bắt đầu (${exp.startDate}) sau thời gian kết thúc (${exp.endDate}).`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return false;
      }
    }

    for (let i = 0; i < credentials.length; i++) {
      const cred = credentials[i];
      if (!cred.name.trim() || !cred.issuer.trim() || !cred.issuedAt.trim()) {
        setErrorMsg(`Vui lòng nhập đầy đủ thông tin (Tên chứng chỉ, Đơn vị cấp, Thời gian cấp) cho chứng chỉ #${i + 1}.`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return false;
      }

      if (!datePattern.test(cred.issuedAt)) {
        setErrorMsg(`Thời gian cấp của chứng chỉ #${i + 1} phải đúng định dạng MM/YY (ví dụ: 06/26).`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return false;
      }
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
            Lưu Portfolio Thành Công!
          </h1>
          
          <p style={{
            color: 'var(--muted)',
            lineHeight: '1.6',
            marginBottom: '32px',
            fontSize: '1rem',
            textAlign: 'center'
          }}>
            Hồ sơ 3D và Proof of Work của bạn đã được ghi nhận chính thức trên hệ thống <strong>nextplease</strong>. Bạn đã sẵn sàng để khám phá các cơ hội nghề nghiệp.
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <Link to="/candidate/login" className="button primary-button" style={{
              justifyContent: 'center',
              padding: '14px',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              Đăng nhập ngay
            </Link>
            
            <Link to="/" className="button secondary-button" style={{
              justifyContent: 'center',
              padding: '14px',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              Về trang chủ
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="portfolio-page">
      <div className="portfolio-hero">
        <div>
          <Link className="portfolio-back-link" to="/">
            <ArrowLeft size={17} />
            Về trang chủ
          </Link>
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
              />
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
                  />
                </label>
                <label>
                  Tổ chức / dự án
                  <input
                    onChange={(event) =>
                      updateExperience(experience.id, 'organization', event.target.value)
                    }
                    placeholder="Ví dụ: Campus Tech Summit"
                    value={experience.organization}
                  />
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
                    />
                  </label>
                  <label>
                    Thời gian kết thúc
                    <input
                      onChange={(event) =>
                        handleExperienceDateChange(experience.id, 'endDate', event.target.value)
                      }
                      placeholder="mm/yy (Ví dụ: 06/26)"
                      value={experience.endDate || ''}
                    />
                  </label>
                </div>
                <label className="full-field">
                  Mô tả kinh nghiệm
                  <textarea
                    onChange={(event) => updateExperience(experience.id, 'detail', event.target.value)}
                    placeholder="Mô tả vai trò, kết quả, quy mô sự kiện/dự án và proof có thể xác minh."
                    rows="3"
                    value={experience.detail}
                  />
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
                  />
                </label>
                <label>
                  Đơn vị cấp
                  <input
                    onChange={(event) => updateCredential(credential.id, 'issuer', event.target.value)}
                    placeholder="Ví dụ: British Council / Coursera"
                    value={credential.issuer}
                  />
                </label>
                <label>
                  Thời gian cấp (MM/YY)
                  <input
                    onChange={(event) => handleIssuedAtChange(credential.id, event.target.value)}
                    placeholder="Ví dụ: 06/26"
                    value={credential.issuedAt}
                  />
                </label>
                <label className="credential-upload-field">
                  File bằng cấp / chứng chỉ
                  <span className="upload-dropzone">
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
                  <h3>Thông tin cơ bản</h3>
                  <div className="confirm-field"><strong>Họ và tên:</strong> {profile.name || 'Chưa nhập'}</div>
                  <div className="confirm-field"><strong>Headline:</strong> {profile.headline || 'Chưa nhập'}</div>
                  <div className="confirm-field"><strong>Trường học:</strong> {profile.school || 'Chưa nhập'}</div>
                  <div className="confirm-field"><strong>Khu vực:</strong> {profile.location || 'Chưa nhập'}</div>
                  <div className="confirm-field"><strong>Giới thiệu:</strong> {profile.bio || 'Chưa nhập'}</div>
                </div>

                <div className="confirm-section">
                  <h3>Kỹ năng</h3>
                  <div className="confirm-skills">
                    {skills.length > 0 ? (
                      skills.map((skill) => (
                        <span className="confirm-skill-tag" key={skill}>{skill}</span>
                      ))
                    ) : (
                      <span className="confirm-field" style={{ color: 'var(--ink-muted)' }}>Chưa có kỹ năng nào.</span>
                    )}
                  </div>
                </div>

                <div className="confirm-section">
                  <h3>Kinh nghiệm nổi bật</h3>
                  {experiences.filter(exp => exp.title.trim() || exp.organization.trim()).length > 0 ? (
                    experiences.filter(exp => exp.title.trim() || exp.organization.trim()).map((exp, index) => (
                      <div className="confirm-list-item" key={exp.id || index}>
                        <strong>{exp.title}</strong> tại <em>{exp.organization}</em>
                        {(exp.startDate || exp.endDate) && (
                          <span style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginLeft: '8px' }}>
                            ({exp.startDate || '?'}{exp.endDate ? ` - ${exp.endDate}` : ''})
                          </span>
                        )}
                        <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--ink-muted)' }}>{exp.detail}</p>
                      </div>
                    ))
                  ) : (
                    <span className="confirm-field" style={{ color: 'var(--ink-muted)' }}>Chưa nhập kinh nghiệm.</span>
                  )}
                </div>

                <div className="confirm-section">
                  <h3>Bằng cấp & chứng chỉ</h3>
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
    </section>
  );
}
