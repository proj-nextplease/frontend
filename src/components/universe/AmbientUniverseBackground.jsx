import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

function createBokehTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.25, 'rgba(185, 255, 0, 0.85)');
  grad.addColorStop(0.55, 'rgba(45, 212, 191, 0.35)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

export function AmbientUniverseBackground({ className = '' }) {
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
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07211a, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 22);

    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(16, 20, 20);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xb9ff00, 2.0);
    fillLight.position.set(-18, -10, 16);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x38bdf8, 3.2, 70);
    rimLight.position.set(0, -14, -18);
    scene.add(rimLight);

    // Soft Bokeh Light Dust
    const dustCount = 140;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);

    const cLime = new THREE.Color('#b9ff00');
    const cTeal = new THREE.Color('#2dd4bf');
    const cCream = new THREE.Color('#f5e7df');

    for (let i = 0; i < dustCount; i++) {
      const i3 = i * 3;
      const r = 16 + Math.random() * 38;
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
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dustField = new THREE.Points(dustGeo, dustMat);
    scene.add(dustField);

    // Sculpted 3D Fonlio Monolith floating in the background
    const logoGroup = new THREE.Group();
    logoGroup.position.set(-6, -4, -6);
    logoGroup.scale.setScalar(0.85);
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
        const scaleFactor = 6.2 / Math.max(size.x, size.y);
        logoScene.scale.setScalar(scaleFactor);

        const logoMat = new THREE.MeshStandardMaterial({
          color: 0x1a5344,
          emissive: 0x0f3b30,
          emissiveIntensity: 0.4,
          metalness: 0.85,
          roughness: 0.2,
        });

        logoScene.traverse((child) => {
          if (child.isMesh) {
            child.material = logoMat;
          }
        });

        logoGroup.add(logoScene);
      },
      undefined,
      (err) => console.warn('Could not load background 3D logo:', err)
    );

    // Mouse parallax
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

      // Soft breathing hover
      logoGroup.position.y = -4 + Math.sin(elapsed * 1.2) * 0.25;
      logoGroup.rotation.y = Math.sin(elapsed * 0.8) * 0.15;

      // Mouse damping
      masterGroup.rotation.y += (mouseX * 0.12 - masterGroup.rotation.y) * 0.04;
      masterGroup.rotation.x += (-mouseY * 0.08 - masterGroup.rotation.x) * 0.04;

      dustField.rotation.y += 0.0004;

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
