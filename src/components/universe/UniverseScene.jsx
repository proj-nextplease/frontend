import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Fonlio Waitlist Design Tokens & Color Harmonies
 * Inspired directly by fonlio.online/waitlist
 */
const CATEGORY_PALETTES = {
  TECH: {
    core: '#b9ff00',
    glow: '#2dd4bf',
    ambient: 0xb9ff00,
  },
  MEDIA: {
    core: '#ff6b4a',
    glow: '#ffa07a',
    ambient: 0xff6b4a,
  },
  BIZ: {
    core: '#a855f7',
    glow: '#c084fc',
    ambient: 0xa855f7,
  },
  SOCIAL: {
    core: '#2dd4bf',
    glow: '#b9ff00',
    ambient: 0x2dd4bf,
  },
  DEFAULT: {
    core: '#b9ff00',
    glow: '#2dd4bf',
    ambient: 0xb9ff00,
  },
};

function getCategoryPalette(category = '') {
  const c = String(category).toUpperCase();
  if (c.includes('TECH') || c.includes('DEV') || c.includes('CÔNG NGHỆ') || c.includes('KỸ THUẬT')) {
    return CATEGORY_PALETTES.TECH;
  }
  if (c.includes('MEDIA') || c.includes('DESIGN') || c.includes('SÁNG TẠO') || c.includes('THIẾT KẾ')) {
    return CATEGORY_PALETTES.MEDIA;
  }
  if (c.includes('BIZ') || c.includes('KINH TẾ') || c.includes('MARKETING') || c.includes('QUẢN TRỊ')) {
    return CATEGORY_PALETTES.BIZ;
  }
  if (c.includes('CLB') || c.includes('XÃ HỘI') || c.includes('MÔI TRƯỜNG') || c.includes('TÌNH NGUYỆN')) {
    return CATEGORY_PALETTES.SOCIAL;
  }
  return CATEGORY_PALETTES.DEFAULT;
}

/**
 * Generates a soft glowing bokeh sprite texture for realistic light dust
 */
function createBokehTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.2, 'rgba(185, 255, 0, 0.9)');
  grad.addColorStop(0.55, 'rgba(45, 212, 191, 0.35)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

/**
 * Creates a crisp 3D Billboard Label for each memory
 */
function createMemoryLabelSprite(exp) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Pill Background
  ctx.fillStyle = 'rgba(8, 32, 26, 0.92)';
  ctx.strokeStyle = exp.verified ? 'rgba(185, 255, 0, 0.7)' : 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 4;

  const r = 36;
  const x = 16, y = 16, w = 480, h = 96;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Pulsing dot
  ctx.fillStyle = exp.verified ? '#b9ff00' : '#2dd4bf';
  ctx.beginPath();
  ctx.arc(x + 38, y + 48, 12, 0, Math.PI * 2);
  ctx.fill();

  // Title Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "Be Vietnam Pro", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const rawTitle = exp.title || 'Ký ức';
  const truncatedTitle = rawTitle.length > 20 ? rawTitle.substring(0, 19) + '...' : rawTitle;
  ctx.fillText(truncatedTitle, x + 64, y + 36);

  // Subtitle (Org / Category)
  ctx.fillStyle = 'rgba(245, 231, 223, 0.8)';
  ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
  const rawSub = exp.organization || exp.category || '';
  const truncatedSub = rawSub.length > 26 ? rawSub.substring(0, 24) + '...' : rawSub;
  ctx.fillText(truncatedSub, x + 64, y + 68);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(3.4, 0.85, 1);
  sprite.position.set(0, -1.9, 0);
  return sprite;
}

/**
 * Creates an exquisite, photorealistic Optical Crystal Glass Memory Orb
 */
function createMemoryOrb(exp, idx) {
  const group = new THREE.Group();
  group.name = `memory-orb-${exp.id || idx}`;
  group.userData = { experience: exp, index: idx };

  const isVerified = Boolean(exp.verified);
  const palette = getCategoryPalette(exp.category);
  const coreColor = new THREE.Color(palette.core);
  const glowColor = new THREE.Color(palette.glow);

  // 1. Outer Translucent Optical Glass Sphere with Real Specular Refraction
  const glassGeo = new THREE.SphereGeometry(1.28, 64, 64);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: isVerified ? 0xffffff : coreColor,
    roughness: 0.05,
    metalness: 0.05,
    transmission: 0.9,
    thickness: 1.4,
    ior: 1.5,
    reflectivity: 0.95,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    transparent: true,
    opacity: 0.92,
    emissive: coreColor,
    emissiveIntensity: isVerified ? 0.35 : 0.2,
  });
  const glassMesh = new THREE.Mesh(glassGeo, glassMat);
  glassMesh.userData = { isClickable: true, experience: exp };
  group.add(glassMesh);

  // 2. Inner Glowing Gemstone Nucleus (The living memory soul)
  const nucleusGeo = new THREE.DodecahedronGeometry(0.55, 0);
  const nucleusMat = new THREE.MeshStandardMaterial({
    color: coreColor,
    emissive: coreColor,
    emissiveIntensity: isVerified ? 2.0 : 1.4,
    roughness: 0.1,
    metalness: 0.3,
  });
  const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
  nucleusMesh.name = 'inner-nucleus';
  group.add(nucleusMesh);

  // 3. Point Light Inside Orb (Radiates light from within)
  const internalLight = new THREE.PointLight(palette.ambient, isVerified ? 1.6 : 0.9, 5.5);
  group.add(internalLight);

  // 4. Delicate Planetary Orbit Ring
  const ringGeo = new THREE.TorusGeometry(1.7, 0.03, 16, 64);
  const ringMat = new THREE.MeshStandardMaterial({
    color: isVerified ? 0xb9ff00 : glowColor,
    emissive: isVerified ? 0xb9ff00 : glowColor,
    emissiveIntensity: 0.6,
    metalness: 0.85,
    roughness: 0.2,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI / 2.6;
  ringMesh.name = 'orb-ring';
  group.add(ringMesh);

  // 5. If Verified: Additional Outer Luminous Halo & Energy Node
  if (isVerified) {
    const haloGeo = new THREE.RingGeometry(1.9, 2.02, 48);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xb9ff00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.rotation.x = Math.PI / 2.6;
    haloMesh.name = 'verified-halo';
    group.add(haloMesh);

    // Glowing beacon node on ring
    const beaconGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xb9ff00 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(1.7, 0, 0);
    group.add(beacon);
  }

  // 6. Crisp 3D Billboard Label
  const labelSprite = createMemoryLabelSprite(exp);
  group.add(labelSprite);

  return { group, glassMesh, nucleusMesh };
}

export function UniverseScene({
  experiences = [],
  onSelectExperience = () => {},
  className = '',
}) {
  const containerRef = useRef(null);
  const [hoveredExp, setHoveredExp] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false });

  const sceneStateRef = useRef({
    renderer: null,
    scene: null,
    camera: null,
    masterGroup: null,
    logoModel: null,
    orbItems: [],
    clickableMeshes: [],
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(-9999, -9999),
    targetCameraPos: new THREE.Vector3(0, 7.5, 24),
    targetLookAt: new THREE.Vector3(0, 0, 0),
    currentLookAt: new THREE.Vector3(0, 0, 0),
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    rotationVelocity: { x: 0, y: 0 },
    hoveredItem: null,
  });

  const resetCamera = useCallback(() => {
    const s = sceneStateRef.current;
    if (!s.camera) return;
    s.targetCameraPos.set(0, 7.5, 24);
    s.targetLookAt.set(0, 0, 0);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.resetCamera = resetCamera;
    }
  }, [resetCamera]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return undefined;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08241d, 0.012);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 7.5, 24);

    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // ── 1. Load HDRI Environment Map from Waitlist Assets ──────────
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      '/waitlist-clone/home/hero/textures/desktop/scene-gradient.webp',
      (envTex) => {
        envTex.mapping = THREE.EquirectangularReflectionMapping;
        envTex.colorSpace = THREE.SRGBColorSpace;
        scene.environment = envTex;
      },
      undefined,
      (err) => console.warn('Could not load environment texture:', err)
    );

    // ── 2. Studio Lighting Setup ──────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.8);
    scene.add(ambientLight);

    // Key Light - Crisp Warm White
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(16, 24, 20);
    scene.add(keyLight);

    // Fill Light - Electric Lime Studio Accent
    const fillLight = new THREE.DirectionalLight(0xb9ff00, 2.0);
    fillLight.position.set(-20, -6, 16);
    scene.add(fillLight);

    // Rim Backlight - High Intensity Cyan Refraction Rim
    const rimLight = new THREE.PointLight(0x38bdf8, 3.8, 80);
    rimLight.position.set(0, -14, -20);
    scene.add(rimLight);

    // ── 3. Dreamy Bokeh Light Dust (Soft Glowing Particles) ───────
    const dustCount = 180;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);

    const cLime = new THREE.Color('#b9ff00');
    const cTeal = new THREE.Color('#2dd4bf');
    const cCream = new THREE.Color('#f5e7df');

    for (let i = 0; i < dustCount; i++) {
      const i3 = i * 3;
      const r = 18 + Math.random() * 42;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      dustPos[i3] = r * Math.sin(phi) * Math.cos(theta);
      dustPos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
      dustPos[i3 + 2] = r * Math.cos(phi);

      const dice = Math.random();
      const col = dice > 0.65 ? cLime : dice > 0.35 ? cTeal : cCream;
      dustColors[i3] = col.r;
      dustColors[i3 + 1] = col.g;
      dustColors[i3 + 2] = col.b;
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));

    const bokehTex = createBokehTexture();
    const dustMat = new THREE.PointsMaterial({
      size: 2.2,
      map: bokehTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dustField = new THREE.Points(dustGeo, dustMat);
    scene.add(dustField);

    // ── 4. Centerpiece: Real 3D Sculpted Fonlio Logo & Pedestal ───
    const centerGroup = new THREE.Group();
    centerGroup.name = 'fonlio-centerpiece-group';
    masterGroup.add(centerGroup);

    // Center warm glow light
    const centerLight = new THREE.PointLight(0xb9ff00, 3.2, 28);
    centerGroup.add(centerLight);

    // Frosted Emerald Pedestal Orb
    const pedestalGeo = new THREE.SphereGeometry(2.3, 64, 64);
    const pedestalMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a3229,
      emissive: 0x06201a,
      emissiveIntensity: 0.4,
      roughness: 0.1,
      metalness: 0.4,
      transmission: 0.75,
      thickness: 1.4,
      clearcoat: 1.0,
    });
    const pedestalMesh = new THREE.Mesh(pedestalGeo, pedestalMat);
    centerGroup.add(pedestalMesh);

    // Double Gyroscope Rings around Core
    const ring1Geo = new THREE.TorusGeometry(3.6, 0.05, 16, 96);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0xb9ff00,
      emissive: 0xb9ff00,
      emissiveIntensity: 0.65,
      metalness: 0.85,
      roughness: 0.2,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.name = 'gyro-ring-1';
    centerGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(4.3, 0.04, 16, 96);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      emissive: 0x2dd4bf,
      emissiveIntensity: 0.55,
      metalness: 0.85,
      roughness: 0.2,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.name = 'gyro-ring-2';
    ring2.rotation.x = Math.PI / 2.6;
    ring2.rotation.y = Math.PI / 4;
    centerGroup.add(ring2);

    // Load Official 3D GLTF Model of Fonlio Logo
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      '/waitlist-clone/home/hero/logo-fonlio.glb',
      (gltf) => {
        const logoScene = gltf.scene;
        // Center the 3D model
        const box = new THREE.Box3().setFromObject(logoScene);
        const center = new THREE.Vector3();
        box.getCenter(center);
        logoScene.position.sub(center);

        const size = new THREE.Vector3();
        box.getSize(size);
        const scaleFactor = 5.4 / Math.max(size.x, size.y);
        logoScene.scale.setScalar(scaleFactor);

        // Apply luxury high-gloss emerald/lime material
        const logoMat = new THREE.MeshStandardMaterial({
          color: 0xb9ff00,
          emissive: 0x14532d,
          emissiveIntensity: 0.4,
          metalness: 0.8,
          roughness: 0.2,
          envMapIntensity: 2.2,
        });

        logoScene.traverse((child) => {
          if (child.isMesh) {
            child.material = logoMat;
            child.castShadow = true;
          }
        });

        // Slight tilt upward so letters face camera directly
        logoScene.rotation.x = -0.18;
        logoScene.position.z = 0.5;
        centerGroup.add(logoScene);
        sceneStateRef.current.logoModel = logoScene;
      },
      undefined,
      (err) => {
        console.warn('Could not load logo-fonlio.glb:', err);
      }
    );

    // ── 5. Living Proof Optical Crystal Memory Orbs ────────────────
    const orbItems = [];
    const clickableMeshes = [];
    const count = experiences.length;

    experiences.forEach((exp, idx) => {
      const baseRadius = 7.6 + idx * 2.8;
      const orbitSpeed = 0.002 / (1 + idx * 0.16);
      const orbitAngle = idx * ((Math.PI * 2) / Math.max(count, 1)) + idx * 0.35;
      const orbitTilt = (idx % 2 === 0 ? 1 : -1) * 0.11 * (idx + 1);

      // Architectural orbital ellipse track
      const orbitCurve = new THREE.EllipseCurve(0, 0, baseRadius, baseRadius * 0.94, 0, 2 * Math.PI, false, 0);
      const pts = orbitCurve.getPoints(80).map((p) => new THREE.Vector3(p.x, 0, p.y));
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const orbitMat = new THREE.LineBasicMaterial({
        color: exp.verified ? 0xb9ff00 : 0x1f473c,
        transparent: true,
        opacity: exp.verified ? 0.45 : 0.22,
      });
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      orbitLine.rotation.x = orbitTilt;
      masterGroup.add(orbitLine);

      // Create Optical Crystal Orb
      const { group: orbGroup, glassMesh, nucleusMesh } = createMemoryOrb(exp, idx);
      masterGroup.add(orbGroup);

      clickableMeshes.push(glassMesh);

      orbItems.push({
        group: orbGroup,
        glassMesh,
        nucleusMesh,
        experience: exp,
        radius: baseRadius,
        speed: orbitSpeed,
        angle: orbitAngle,
        tilt: orbitTilt,
        floatPhase: Math.random() * Math.PI * 2,
      });
    });

    // Update state ref
    const s = sceneStateRef.current;
    s.renderer = renderer;
    s.scene = scene;
    s.camera = camera;
    s.masterGroup = masterGroup;
    s.orbItems = orbItems;
    s.clickableMeshes = clickableMeshes;

    // ── 6. Mouse Parallax & Interaction Listeners ──────────────────
    let mouseTargetRotationX = 0;
    let mouseTargetRotationY = 0;

    function onPointerMove(e) {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      s.mouse.x = x;
      s.mouse.y = y;

      if (s.isDragging) {
        const deltaX = e.clientX - s.dragStart.x;
        const deltaY = e.clientY - s.dragStart.y;
        s.rotationVelocity.y = deltaX * 0.003;
        s.rotationVelocity.x = deltaY * 0.003;
        masterGroup.rotation.y += s.rotationVelocity.y;
        masterGroup.rotation.x += s.rotationVelocity.x;
        s.dragStart.x = e.clientX;
        s.dragStart.y = e.clientY;
      } else {
        mouseTargetRotationY = x * 0.16;
        mouseTargetRotationX = -y * 0.12;
      }
    }

    function onPointerDown(e) {
      s.isDragging = true;
      s.dragStart.x = e.clientX;
      s.dragStart.y = e.clientY;
    }

    function onPointerUp() {
      s.isDragging = false;
      if (s.camera) {
        s.raycaster.setFromCamera(s.mouse, s.camera);
        const intersects = s.raycaster.intersectObjects(s.clickableMeshes);
        if (intersects.length > 0) {
          const hitExp = intersects[0].object.userData.experience;
          if (hitExp) {
            onSelectExperience(hitExp);
            // Smoothly fly camera toward target
            const hitGroup = intersects[0].object.parent;
            if (hitGroup) {
              const worldPos = new THREE.Vector3();
              hitGroup.getWorldPosition(worldPos);
              s.targetCameraPos.set(worldPos.x * 0.7, worldPos.y + 2.5, worldPos.z + 6.5);
              s.targetLookAt.copy(worldPos);
            }
          }
        }
      }
    }

    function onWheel(e) {
      if (!s.camera) return;
      s.targetCameraPos.z = THREE.MathUtils.clamp(
        s.targetCameraPos.z + e.deltaY * 0.02,
        14,
        42
      );
    }

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: true });

    // ── 7. Animation Loop ─────────────────────────────────────────
    let animationId;
    const clock = new THREE.Clock();

    function animate() {
      animationId = requestAnimationFrame(animate);
      const _delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Centerpiece Gyroscope Rotations
      if (centerGroup) {
        centerGroup.position.y = Math.sin(elapsed * 1.4) * 0.15;
        const r1 = centerGroup.getObjectByName('gyro-ring-1');
        if (r1) r1.rotation.z += 0.01;
        const r2 = centerGroup.getObjectByName('gyro-ring-2');
        if (r2) {
          r2.rotation.x += 0.007;
          r2.rotation.y += 0.009;
        }
      }

      // Smooth inertia rotation damping
      if (!s.isDragging) {
        masterGroup.rotation.y += (mouseTargetRotationY - masterGroup.rotation.y) * 0.04;
        masterGroup.rotation.x += (mouseTargetRotationX - masterGroup.rotation.x) * 0.04;
      }

      // Memory Orbs Orbit & Float Update
      orbItems.forEach((item) => {
        item.angle += item.speed;
        const x = Math.cos(item.angle) * item.radius;
        const z = Math.sin(item.angle) * item.radius * 0.94;
        const y = Math.sin(item.angle) * item.radius * Math.tan(item.tilt) + Math.sin(elapsed * 1.5 + item.floatPhase) * 0.35;

        item.group.position.set(x, y, z);
        item.group.rotation.y += 0.008;

        if (item.nucleusMesh) {
          item.nucleusMesh.rotation.x += 0.015;
          item.nucleusMesh.rotation.y += 0.02;
        }

        const orbRing = item.group.getObjectByName('orb-ring');
        if (orbRing) {
          orbRing.rotation.z += 0.012;
        }

        const vHalo = item.group.getObjectByName('verified-halo');
        if (vHalo) {
          vHalo.rotation.z -= 0.015;
        }
      });

      // Dust motes gentle drift
      dustField.rotation.y += 0.0003;

      // Camera smooth glide towards target
      camera.position.lerp(s.targetCameraPos, 0.05);
      s.currentLookAt.lerp(s.targetLookAt, 0.06);
      camera.lookAt(s.currentLookAt);

      // Raycasting for Tooltip Hover
      s.raycaster.setFromCamera(s.mouse, camera);
      const intersects = s.raycaster.intersectObjects(s.clickableMeshes);
      if (intersects.length > 0) {
        const hoveredMesh = intersects[0].object;
        const exp = hoveredMesh.userData.experience;
        if (exp && s.hoveredItem !== hoveredMesh) {
          s.hoveredItem = hoveredMesh;
          setHoveredExp(exp);

          // Project to 2D screen coordinates
          const worldPos = new THREE.Vector3();
          hoveredMesh.getWorldPosition(worldPos);
          worldPos.project(camera);

          const screenX = ((worldPos.x + 1) * width) / 2;
          const screenY = ((-worldPos.y + 1) * height) / 2;

          setTooltipPos({
            x: Math.min(Math.max(screenX, 160), width - 160),
            y: Math.max(screenY - 35, 80),
            visible: true,
          });

          // Scale hovered orb group
          hoveredMesh.parent.scale.set(1.22, 1.22, 1.22);
          container.style.cursor = 'pointer';
        }
      } else {
        if (s.hoveredItem) {
          s.hoveredItem.parent.scale.set(1, 1, 1);
          s.hoveredItem = null;
          setHoveredExp(null);
          setTooltipPos((prev) => ({ ...prev, visible: false }));
          container.style.cursor = s.isDragging ? 'grabbing' : 'default';
        }
      }

      renderer.render(scene, camera);
    }

    animate();

    function onResize() {
      if (!container) return;
      const newW = container.clientWidth || window.innerWidth;
      const newH = container.clientHeight || window.innerHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    }

    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('wheel', onWheel);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [experiences, onSelectExperience]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Authentic Fonlio .lab-badge Floating Tooltip */}
      {tooltipPos.visible && hoveredExp && (
        <div
          style={{
            position: 'absolute',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            zIndex: 60,
            animation: 'npTooltipPop 0.22s cubic-bezier(0.22, 1, 0.36, 1) forwards',
          }}
        >
          <div
            style={{
              padding: '12px 18px 12px 16px',
              borderRadius: '18px',
              backgroundColor: 'rgba(10, 41, 34, 0.92)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6), 0 0 25px rgba(185, 255, 0, 0.2)',
              color: '#f5e7df',
              fontFamily: "'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif",
              minWidth: '230px',
              maxWidth: '310px',
            }}
          >
            {/* Eyebrow with pulsing dot */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: hoveredExp.verified ? '#b9ff00' : '#2dd4bf',
                marginBottom: '4px',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: hoveredExp.verified ? '#b9ff00' : '#2dd4bf',
                  display: 'inline-block',
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    backgroundColor: 'inherit',
                    animation: 'npPulseLime 1.8s infinite',
                  }}
                />
              </span>
              <span>{hoveredExp.category || 'Ký ức'}</span>
            </div>

            {/* Title */}
            <div
              style={{
                fontFamily: "'Be Vietnam Pro', sans-serif",
                fontSize: '15px',
                fontWeight: 800,
                lineHeight: 1.25,
                color: '#ffffff',
                marginBottom: '4px',
              }}
            >
              {hoveredExp.title}
            </div>

            {/* Organization / Role */}
            <div
              style={{
                fontSize: '12px',
                color: 'rgba(245, 231, 223, 0.75)',
                marginBottom: '8px',
              }}
            >
              {hoveredExp.roleLevel ? `${hoveredExp.roleLevel} • ` : ''}
              {hoveredExp.organization}
            </div>

            {/* Hint */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#b9ff00',
              }}
            >
              Bấm để mở bảo chứng sống →
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes npTooltipPop {
          from {
            opacity: 0;
            transform: translate(-50%, -85%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -100%) scale(1);
          }
        }
        @keyframes npPulseLime {
          from { transform: scale(1); opacity: 0.8; }
          to { transform: scale(2.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
