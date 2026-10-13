import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Waitlist3DScene
 * - Lightweight, ultra-smooth Three.js 3D background canvas.
 * - Renders an interactive 3D universe:
 *   1. Glowing neon wireframe Icosahedron & Torus orbit.
 *   2. Floating 3D particle constellation with neon lime & cyan depth.
 *   3. Smooth mouse parallax tracking with lerp damping.
 *   4. Low GPU footprint, automatic resize handling & memory cleanup.
 */
export function Waitlist3DScene({ className = '', style = {} }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    // Check WebGL support
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
    const height = container.clientHeight || 700;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 18);

    // Group for mouse parallax rotation
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // ── 1. Floating 3D Particles Constellation ──
    const particleCount = 260;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const colorLime = new THREE.Color('#b9ff00');
    const colorTeal = new THREE.Color('#2dd4bf');
    const colorWhite = new THREE.Color('#ffffff');

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Distribute in a spherical cylinder volume
      const radius = 6 + Math.random() * 16;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 18;

      particlePositions[i3] = Math.cos(theta) * radius;
      particlePositions[i3 + 1] = y;
      particlePositions[i3 + 2] = (Math.sin(theta) * radius * 0.7) - 4;

      const choice = Math.random();
      const c = choice < 0.55 ? colorLime : choice < 0.85 ? colorTeal : colorWhite;
      particleColors[i3] = c.r;
      particleColors[i3 + 1] = c.g;
      particleColors[i3 + 2] = c.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    // Simple circular particle canvas texture for soft glow points
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(185, 255, 0, 0.8)');
      grad.addColorStop(0.8, 'rgba(45, 212, 191, 0.3)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 32, 32);
    }
    const particleTex = new THREE.CanvasTexture(pCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.36,
      map: particleTex,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const points = new THREE.Points(particleGeo, particleMat);
    masterGroup.add(points);

    // ── 2. Geometric 3D Wireframe Core ──
    const coreGeo = new THREE.IcosahedronGeometry(3.6, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xb9ff00,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(5.2, 0.5, -2);
    masterGroup.add(coreMesh);

    // Inner glowing sphere inside icosahedron
    const innerGeo = new THREE.IcosahedronGeometry(2.1, 0);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    innerMesh.position.copy(coreMesh.position);
    masterGroup.add(innerMesh);

    // ── 3. Orbital 3D Wireframe Rings ──
    const ringGeo1 = new THREE.TorusGeometry(5.2, 0.03, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xb9ff00,
      transparent: true,
      opacity: 0.38,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.position.copy(coreMesh.position);
    ring1.rotation.x = Math.PI * 0.35;
    ring1.rotation.y = Math.PI * 0.15;
    masterGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(6.6, 0.02, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.25,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.position.copy(coreMesh.position);
    ring2.rotation.x = -Math.PI * 0.25;
    ring2.rotation.y = Math.PI * 0.4;
    masterGroup.add(ring2);

    // ── 4. Mouse Interactive Parallax Tracking ──
    let targetRotX = 0;
    let targetRotY = 0;
    let curRotX = 0;
    let curRotY = 0;

    const handleMouseMove = (e) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      const x = (e.clientX - halfW) / halfW;
      const y = (e.clientY - halfH) / halfH;
      targetRotY = x * 0.32;
      targetRotX = y * 0.22;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // ── 5. Resize Listener ──
    const handleResize = () => {
      if (!container || !renderer) return;
      const newW = container.clientWidth || window.innerWidth;
      const newH = container.clientHeight || 700;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // ── 6. Animation Loop ──
    let reqId;
    let clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Lerp mouse movement for buttery smoothness
      curRotX += (targetRotX - curRotX) * 0.045;
      curRotY += (targetRotY - curRotY) * 0.045;
      masterGroup.rotation.x = curRotX;
      masterGroup.rotation.y = curRotY;

      // Slow ambient 3D rotations
      points.rotation.y = elapsed * 0.025;
      points.rotation.x = Math.sin(elapsed * 0.03) * 0.05;

      coreMesh.rotation.x = elapsed * 0.09;
      coreMesh.rotation.y = elapsed * 0.12;

      innerMesh.rotation.x = -elapsed * 0.14;
      innerMesh.rotation.y = -elapsed * 0.08;

      ring1.rotation.z = elapsed * 0.08;
      ring2.rotation.z = -elapsed * 0.06;

      // Gentle floating bob
      coreMesh.position.y = 0.5 + Math.sin(elapsed * 0.8) * 0.35;
      innerMesh.position.y = coreMesh.position.y;
      ring1.position.y = coreMesh.position.y;
      ring2.position.y = coreMesh.position.y;

      renderer.render(scene, camera);
    };

    animate();

    // ── 7. Clean up ──
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
      coreGeo.dispose();
      coreMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`wl-3d-scene ${className}`.trim()}
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
