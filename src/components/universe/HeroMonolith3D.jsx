import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

function createDustTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.3, 'rgba(185, 255, 0, 0.85)');
  grad.addColorStop(0.65, 'rgba(45, 212, 191, 0.35)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

export function HeroMonolith3D({ className = '' }) {
  const containerRef = useRef(null);

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
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x061f19, 0.016);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18);

    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // Studio Lighting setup matching Fonlio Waitlist aesthetic
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(15, 20, 22);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xb9ff00, 2.4);
    fillLight.position.set(-18, -12, 16);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x2dd4bf, 4.0, 60);
    rimLight.position.set(0, 12, -15);
    scene.add(rimLight);

    // Ambient floating dust particles
    const dustCount = 120;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);

    const cLime = new THREE.Color('#b9ff00');
    const cTeal = new THREE.Color('#2dd4bf');
    const cCream = new THREE.Color('#f5e7df');

    for (let i = 0; i < dustCount; i++) {
      const i3 = i * 3;
      const r = 8 + Math.random() * 26;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      dustPos[i3] = r * Math.sin(phi) * Math.cos(theta);
      dustPos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
      dustPos[i3 + 2] = r * Math.cos(phi);

      const dice = Math.random();
      const col = dice > 0.6 ? cLime : dice > 0.3 ? cTeal : cCream;
      dustColors[i3] = col.r;
      dustColors[i3 + 1] = col.g;
      dustColors[i3 + 2] = col.b;
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));

    const dustTex = createDustTexture();
    const dustMat = new THREE.PointsMaterial({
      size: 2.2,
      map: dustTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dustField = new THREE.Points(dustGeo, dustMat);
    scene.add(dustField);

    // Sculpted 3D Fonlio Logo Monolith in Center
    const logoGroup = new THREE.Group();
    masterGroup.add(logoGroup);

    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      '/waitlist-clone/home/hero/logo-fonlio.glb',
      (gltf) => {
        const logoScene = gltf.scene;
        const box = new THREE.Box3().setFromObject(logoScene);
        const center = new THREE.Vector3();
        box.getCenter(center);
        logoScene.position.sub(center);

        const size = new THREE.Vector3();
        box.getSize(size);
        const scaleFactor = 7.5 / Math.max(size.x, size.y);
        logoScene.scale.setScalar(scaleFactor);

        const logoMat = new THREE.MeshStandardMaterial({
          color: 0x1b5a4b,
          emissive: 0x0c3227,
          emissiveIntensity: 0.45,
          metalness: 0.88,
          roughness: 0.18,
        });

        logoScene.traverse((child) => {
          if (child.isMesh) {
            child.material = logoMat;
          }
        });

        logoGroup.add(logoScene);
      },
      undefined,
      (err) => console.warn('Could not load hero 3D logo:', err)
    );

    // Mouse movement parallax
    let mouseX = 0;
    let mouseY = 0;

    function onPointerMove(e) {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    }

    window.addEventListener('pointermove', onPointerMove);

    let animationId;
    const clock = new THREE.Clock();

    function animate() {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Organic hovering & breathing
      logoGroup.position.y = Math.sin(elapsed * 1.4) * 0.35;
      logoGroup.rotation.y = Math.sin(elapsed * 0.7) * 0.22;
      logoGroup.rotation.x = Math.cos(elapsed * 0.9) * 0.08;

      // Mouse damping
      masterGroup.rotation.y += (mouseX * 0.32 - masterGroup.rotation.y) * 0.05;
      masterGroup.rotation.x += (-mouseY * 0.22 - masterGroup.rotation.x) * 0.05;

      dustField.rotation.y += 0.0006;

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
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
    />
  );
}
