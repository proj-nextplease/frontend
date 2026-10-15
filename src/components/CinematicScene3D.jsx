import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * CinematicScene3D
 * - Interactive 3D WebGL Camera & Objects synced directly with the Scrollytelling Filmstrip.
 * - Progress (0.0 to 1.0) drives:
 *   1. Camera coordinates and depth of field (warp speed transitions).
 *   2. 3D Floating CV Paper (Scene 0) -> Shattering explosion (Scene 1).
 *   3. Glowing Neon Emerald Core & Orbital Torus Rings (Scene 1 & 2).
 *   4. Golden 3D Proof Stamp descending & ripple shockwave (Scene 2).
 *   5. Particle warp galaxy with speed bursts between chapters.
 *   6. Mouse parallax physics for immersive depth.
 */
export function CinematicScene3D({ progress = 0, currentScene = 0, className = '', style = {} }) {
  const containerRef = useRef(null);
  const progressRef = useRef(progress);
  const sceneRef = useRef(currentScene);

  // Keep refs up to date without re-triggering Three.js initialization
  useEffect(() => {
    progressRef.current = progress;
    sceneRef.current = currentScene;
  }, [progress, currentScene]);

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
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 16);

    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // ── 1. Cosmic Particle Galaxy ─────────────────────────────────────────
    const particleCount = 380;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleBaseZ = new Float32Array(particleCount);

    const colorLime = new THREE.Color('#b9ff00');
    const colorTeal = new THREE.Color('#2dd4bf');
    const colorGold = new THREE.Color('#f59e0b');
    const colorWhite = new THREE.Color('#ffffff');

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = 5 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 22;
      const z = (Math.random() - 0.5) * 30 - 2;

      particlePositions[i3] = Math.cos(theta) * radius;
      particlePositions[i3 + 1] = y;
      particlePositions[i3 + 2] = z;
      particleBaseZ[i] = z;

      const choice = Math.random();
      const c = choice < 0.45 ? colorLime : choice < 0.7 ? colorTeal : choice < 0.85 ? colorGold : colorWhite;
      particleColors[i3] = c.r;
      particleColors[i3 + 1] = c.g;
      particleColors[i3 + 2] = c.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    // Particle texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(185, 255, 0, 0.85)');
      grad.addColorStop(0.8, 'rgba(45, 212, 191, 0.35)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 32, 32);
    }
    const particleTex = new THREE.CanvasTexture(pCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.38,
      map: particleTex,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const starField = new THREE.Points(particleGeo, particleMat);
    masterGroup.add(starField);

    // ── 2. Scene 0: 3D Paper CV Sheet (Expiring / Fragmenting) ─────────────
    const paperCanvas = document.createElement('canvas');
    paperCanvas.width = 512;
    paperCanvas.height = 724;
    const paperCtx = paperCanvas.getContext('2d');
    if (paperCtx) {
      // Paper background
      paperCtx.fillStyle = '#0f172a';
      paperCtx.fillRect(0, 0, 512, 724);
      paperCtx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      paperCtx.lineWidth = 4;
      paperCtx.strokeRect(16, 16, 480, 692);

      // Header lines
      paperCtx.fillStyle = '#94a3b8';
      paperCtx.fillRect(40, 50, 180, 20);
      paperCtx.fillStyle = '#475569';
      paperCtx.fillRect(40, 85, 280, 12);
      paperCtx.fillRect(40, 110, 240, 10);

      // Skill bars (5 stars fake)
      for (let j = 0; j < 5; j++) {
        paperCtx.fillStyle = '#ef4444';
        paperCtx.fillRect(40, 160 + j * 32, 100, 10);
        paperCtx.fillStyle = '#334155';
        paperCtx.fillRect(160, 160 + j * 32, 280, 10);
      }

      // Warning stamp: "EXPIRED IN 6 SECONDS"
      paperCtx.save();
      paperCtx.translate(256, 440);
      paperCtx.rotate(-0.25);
      paperCtx.strokeStyle = '#ef4444';
      paperCtx.lineWidth = 6;
      paperCtx.strokeRect(-160, -40, 320, 80);
      paperCtx.fillStyle = '#ef4444';
      paperCtx.font = 'bold 28px monospace';
      paperCtx.textAlign = 'center';
      paperCtx.fillText('6 SECONDS LATER...', 0, 10);
      paperCtx.restore();
    }
    const paperTex = new THREE.CanvasTexture(paperCanvas);

    const paperGeo = new THREE.PlaneGeometry(5.2, 7.3, 10, 10);
    const paperMat = new THREE.MeshBasicMaterial({
      map: paperTex,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const paperMesh = new THREE.Mesh(paperGeo, paperMat);
    paperMesh.position.set(0, 0, 4);
    masterGroup.add(paperMesh);

    // ── 3. Scene 1 & 2: Glowing Living Core (Icosahedron & Rings) ──────────
    const coreGroup = new THREE.Group();
    masterGroup.add(coreGroup);

    // Outer wireframe icosahedron
    const coreGeo = new THREE.IcosahedronGeometry(3.2, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xb9ff00,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreMesh);

    // Inner teal poly
    const innerGeo = new THREE.IcosahedronGeometry(2.0, 0);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerMesh);

    // Orbital rings
    const ringGeo1 = new THREE.TorusGeometry(4.6, 0.04, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xb9ff00,
      transparent: true,
      opacity: 0.4,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI * 0.3;
    ringGroup(ring1);
    coreGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(5.8, 0.03, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.32,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI * 0.25;
    ring2.rotation.y = Math.PI * 0.35;
    coreGroup.add(ring2);

    function ringGroup() {}

    // ── 4. Scene 2: 3D Proof Stamp Shockwave Ring ──────────────────────────
    const stampGroup = new THREE.Group();
    masterGroup.add(stampGroup);

    const stampGeo = new THREE.CylinderGeometry(2.4, 2.6, 0.4, 40);
    const stampMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const stampMesh = new THREE.Mesh(stampGeo, stampMat);
    stampMesh.rotation.x = Math.PI * 0.5;
    stampGroup.add(stampMesh);

    // Shockwave ripple ring
    const shockwaveGeo = new THREE.RingGeometry(2.8, 3.1, 48);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0xb9ff00,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwaveMesh.position.z = -0.2;
    stampGroup.add(shockwaveMesh);

    // ── Mouse Parallax Tracking ───────────────────────────────────────────
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      targetX = ((e.clientX - halfW) / halfW) * 0.28;
      targetY = ((e.clientY - halfH) / halfH) * 0.2;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // ── Resize Listener ───────────────────────────────────────────────────
    const handleResize = () => {
      if (!container || !renderer) return;
      const newW = container.clientWidth || window.innerWidth;
      const newH = container.clientHeight || window.innerHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // ── Animation Loop ────────────────────────────────────────────────────
    let reqId;
    const clock = new THREE.Clock();

    // Lerp helpers
    let curCameraZ = 16;
    let curCameraX = 0;
    let curCameraY = 0;

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const p = progressRef.current; // 0.0 to 1.0

      // Mouse lerp
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;
      masterGroup.rotation.y = mouseX;
      masterGroup.rotation.x = mouseY;

      // Dynamic Particle Warp
      // Warp speed increases when transitions occur
      const warpSpeed = 1 + Math.sin(p * Math.PI * 4) * 2;
      const positions = starField.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        // Float particles towards camera or subtle drift
        positions[i3 + 2] += 0.02 * warpSpeed;
        if (positions[i3 + 2] > 18) {
          positions[i3 + 2] = -25;
        }
      }
      starField.geometry.attributes.position.needsUpdate = true;
      starField.rotation.y = elapsed * 0.015;

      // ── SCENE 0: CV Paper (p in [0.0, 0.22]) ─────────────────────────────
      if (p < 0.22) {
        const localP = p / 0.22;
        paperMesh.visible = true;
        paperMesh.position.set(0, Math.sin(elapsed * 1.2) * 0.25, 4 - localP * 2);
        paperMesh.rotation.z = Math.sin(elapsed * 0.8) * 0.08 - localP * 0.3;
        paperMesh.rotation.y = Math.sin(elapsed * 0.6) * 0.15;
        paperMat.opacity = Math.max(0, 0.9 - localP * 1.1);

        // Core is dormant
        coreGroup.visible = false;
        stampGroup.visible = false;

        // Camera stays close
        curCameraZ = 14 + localP * 2;
        curCameraX = 0;
        curCameraY = 0;
      }
      // ── SCENE 1: Awakening / Core Ignites (p in [0.22, 0.44]) ────────────
      else if (p < 0.44) {
        const localP = (p - 0.22) / 0.22;
        paperMesh.visible = false;

        coreGroup.visible = true;
        stampGroup.visible = false;

        // Scale and rise
        const coreScale = Math.min(1.2, 0.3 + localP * 0.9);
        coreGroup.scale.set(coreScale, coreScale, coreScale);
        coreGroup.position.set(3.8 * (1 - localP * 0.2), 0.2, 0);

        coreMesh.rotation.x = elapsed * 0.25;
        coreMesh.rotation.y = elapsed * 0.35;
        innerMesh.rotation.x = -elapsed * 0.4;
        innerMesh.rotation.y = elapsed * 0.2;
        ring1.rotation.z = elapsed * 0.3;
        ring2.rotation.z = -elapsed * 0.25;

        coreMat.opacity = 0.2 + localP * 0.3;
        innerMat.opacity = 0.3 + localP * 0.35;

        curCameraZ = 16 - localP * 2;
        curCameraX = 1.5 * localP;
        curCameraY = 0;
      }
      // ── SCENE 2: The Proof Stamp & Shockwave (p in [0.44, 0.66]) ─────────
      else if (p < 0.66) {
        const localP = (p - 0.44) / 0.22;
        paperMesh.visible = false;
        coreGroup.visible = true;
        stampGroup.visible = true;

        // Core moves to background left
        coreGroup.position.set(-5.5, 0, -4);
        coreGroup.scale.set(0.85, 0.85, 0.85);
        coreMesh.rotation.x = elapsed * 0.15;
        coreMesh.rotation.y = elapsed * 0.2;

        // Stamp swoops down and impacts
        const stampImpact = Math.sin(localP * Math.PI);
        stampGroup.position.set(3.2, 0.5 - stampImpact * 0.6, 2);
        stampGroup.rotation.y = elapsed * 0.4;
        stampGroup.rotation.x = Math.PI * 0.45;

        // Shockwave ripple
        shockwaveMesh.scale.set(1 + stampImpact * 1.8, 1 + stampImpact * 1.8, 1);
        shockwaveMat.opacity = Math.max(0, stampImpact * 0.85);

        curCameraZ = 15;
        curCameraX = 0;
        curCameraY = 0;
      }
      // ── SCENE 3 & 4: Genesis Card / Climax Form (p in [0.66, 1.0]) ───────
      else {
        const localP = (p - 0.66) / 0.34;
        paperMesh.visible = false;
        stampGroup.visible = false;
        coreGroup.visible = true;

        // Ambient glowing backdrop behind the VIP card & finale form
        coreGroup.position.set(0, 1.8, -8);
        coreGroup.scale.set(1.4, 1.4, 1.4);
        coreMat.opacity = 0.18 + Math.sin(elapsed * 2) * 0.05;
        innerMat.opacity = 0.25 + Math.cos(elapsed * 2) * 0.05;

        coreMesh.rotation.x = elapsed * 0.12;
        coreMesh.rotation.y = elapsed * 0.15;
        ring1.rotation.z = elapsed * 0.18;
        ring2.rotation.z = -elapsed * 0.15;

        curCameraZ = 17 - localP * 1.5;
        curCameraX = 0;
        curCameraY = -0.5 * localP;
      }

      // Smooth camera interpolation
      camera.position.z += (curCameraZ - camera.position.z) * 0.06;
      camera.position.x += (curCameraX - camera.position.x) * 0.06;
      camera.position.y += (curCameraY - camera.position.y) * 0.06;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      particleGeo.dispose();
      particleMat.dispose();
      particleTex.dispose();
      paperGeo.dispose();
      paperMat.dispose();
      paperTex.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      stampGeo.dispose();
      stampMat.dispose();
      shockwaveGeo.dispose();
      shockwaveMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`cinematic-3d-canvas ${className}`.trim()}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 1,
        ...style,
      }}
    />
  );
}
