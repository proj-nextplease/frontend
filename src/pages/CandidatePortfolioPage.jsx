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
} from 'lucide-react';

export const PORTFOLIO_PREVIEW_STORAGE_PREFIX = 'nextplease:portfolio-preview:';

const avatarStyles = {
  female: {
    label: 'Nữ',
    skin: '#f4c9a9',
    hair: '#2d1b16',
    outfit: '#2563eb',
    accent: '#f97316',
    bodyScale: [0.9, 1.08, 0.72],
    shoulder: 1.25,
  },
  male: {
    label: 'Nam',
    skin: '#dca77f',
    hair: '#1f2937',
    outfit: '#0f172a',
    accent: '#2563eb',
    bodyScale: [1, 1.05, 0.78],
    shoulder: 1.45,
  },
  neutral: {
    label: 'Linh hoạt',
    skin: '#e7b893',
    hair: '#334155',
    outfit: '#7c3aed',
    accent: '#14b8a6',
    bodyScale: [0.96, 1.04, 0.74],
    shoulder: 1.34,
  },
};

const defaultExperiences = [
  {
    id: 1,
    title: '',
    organization: '',
    detail: '',
  },
];

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

export function PortfolioAvatar3D({ gender }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const style = avatarStyles[gender];
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 1.65, 6.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const avatar = new THREE.Group();
    avatar.position.y = -0.55;
    scene.add(avatar);

    const skin = new THREE.MeshStandardMaterial({ color: style.skin, roughness: 0.54 });
    const hair = new THREE.MeshStandardMaterial({ color: style.hair, roughness: 0.75 });
    const outfit = new THREE.MeshStandardMaterial({ color: style.outfit, roughness: 0.48, metalness: 0.04 });
    const accent = new THREE.MeshStandardMaterial({
      color: style.accent,
      roughness: 0.42,
      metalness: 0.12,
    });
    const white = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.5 });
    const dark = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.66 });

    addMesh(avatar, new THREE.SphereGeometry(0.54, 48, 48), skin, [0, 2.35, 0]);
    addMesh(avatar, new THREE.SphereGeometry(0.57, 48, 24), hair, [0, 2.55, -0.03], [1.03, 0.55, 0.95]);
    addMesh(avatar, new THREE.SphereGeometry(0.08, 18, 18), dark, [-0.19, 2.38, 0.48]);
    addMesh(avatar, new THREE.SphereGeometry(0.08, 18, 18), dark, [0.19, 2.38, 0.48]);
    addMesh(avatar, new THREE.BoxGeometry(0.32, 0.055, 0.055), dark, [0, 2.19, 0.52]);
    addMesh(avatar, new THREE.CapsuleGeometry(0.54, 1.1, 16, 32), outfit, [0, 1.32, 0], style.bodyScale);
    addMesh(avatar, new THREE.CapsuleGeometry(0.13, style.shoulder, 12, 24), outfit, [-0.76, 1.42, 0], [1, 1, 1], [0, 0, -0.42]);
    addMesh(avatar, new THREE.CapsuleGeometry(0.13, style.shoulder, 12, 24), outfit, [0.76, 1.42, 0], [1, 1, 1], [0, 0, 0.42]);
    addMesh(avatar, new THREE.CapsuleGeometry(0.16, 0.92, 12, 24), dark, [-0.28, 0.2, 0], [1, 1, 1], [0.08, 0, 0.08]);
    addMesh(avatar, new THREE.CapsuleGeometry(0.16, 0.92, 12, 24), dark, [0.28, 0.2, 0], [1, 1, 1], [0.08, 0, -0.08]);
    addMesh(avatar, new THREE.TorusGeometry(0.72, 0.018, 12, 96), accent, [0, 1.9, 0.04], [1, 1, 1], [Math.PI / 2, 0, 0]);
    addMesh(avatar, new THREE.BoxGeometry(0.95, 0.12, 0.18), white, [0, 0.9, 0.5]);

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
      avatar.rotation.y = Math.sin(elapsed * 0.55) * 0.22;
      avatar.position.y = -0.55 + Math.sin(elapsed * 1.2) * 0.04;
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
  }, [gender]);

  return <div className="portfolio-avatar-canvas" ref={mountRef} aria-label="3D portfolio avatar preview" />;
}

export function CandidatePortfolioPage() {
  const [gender, setGender] = useState('female');
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
      },
    ]);
  }

  function updateCredential(id, field, value) {
    setCredentials((current) =>
      current.map((credential) =>
        credential.id === id ? { ...credential, [field]: value } : credential,
      ),
    );
  }

  function updateCredentialFile(id, file) {
    updateCredential(id, 'fileName', file?.name || '');
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

  function openPortfolioPreview() {
    const previewId = String(Date.now());
    const previewPayload = {
      gender,
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
        <div className="portfolio-status-card">
          <Sparkles size={22} />
          <strong>Preview trước, backend sau</strong>
          <span>
            Đây là prototype UI. RS, EXP, NP, Premium và verification vẫn phải do backend sở hữu.
          </span>
        </div>
      </div>

      <div className="portfolio-builder">
        <aside className="portfolio-studio">
          <div className="avatar-stage">
            <PortfolioAvatar3D gender={gender} />
          </div>
          <div className="gender-picker" aria-label="Chọn giới tính nhân vật">
            {Object.entries(avatarStyles).map(([key, value]) => (
              <button
                className={gender === key ? 'gender-option active' : 'gender-option'}
                key={key}
                onClick={() => setGender(key)}
                type="button"
              >
                {value.label}
              </button>
            ))}
          </div>
          <div className="portfolio-preview-card">
            <span className="avatar-badge">
              <BadgeCheck size={16} />
              Portfolio draft
            </span>
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

        <div className="portfolio-form-panel">
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
                <h2>Kinh nghiệm & proof nổi bật</h2>
                <p>Ghi theo kết quả thật, vai trò thật và bằng chứng có thể xác minh.</p>
              </div>
            </div>

            {experiences.map((experience, index) => (
              <article className="experience-edit-card" key={experience.id}>
                <div className="experience-index">{index + 1}</div>
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
                <p>Nộp file chứng minh để backend đưa vào hàng chờ xác thực sau này.</p>
              </div>
            </div>

            {credentials.map((credential, index) => (
              <article className="credential-edit-card" key={credential.id}>
                <div className="credential-index">{index + 1}</div>
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
                  Thời gian cấp
                  <input
                    onChange={(event) => updateCredential(credential.id, 'issuedAt', event.target.value)}
                    placeholder="Ví dụ: 06/2026"
                    value={credential.issuedAt}
                  />
                </label>
                <label className="credential-upload-field">
                  File bằng cấp / chứng chỉ
                  <span className="upload-dropzone">
                    <FileUp size={20} />
                    <span>
                      {credential.fileName || 'Tải lên PDF, PNG hoặc JPG'}
                      <small>File sẽ được gửi sang backend/file_assets khi nối API.</small>
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
                <h2>Xem portfolio như ứng viên thật</h2>
                <p>
                  Mở một tab preview riêng từ dữ liệu bạn đang nhập. Đây vẫn là bản nháp UI,
                  chưa gửi sang backend.
                </p>
              </div>
            </div>
            <button className="button primary-button preview-open-button" onClick={openPortfolioPreview} type="button">
              <Eye size={18} />
              Xem trước
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
