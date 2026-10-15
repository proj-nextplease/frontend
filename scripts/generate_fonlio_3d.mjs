import fs from 'fs';
import zlib from 'zlib';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

// Polyfill FileReader for Node.js
global.FileReader = class FileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(buf => {
      this.result = buf;
      if (this.onloadend) this.onloadend();
    });
  }
};

// 1. Decode PNG
const buf = fs.readFileSync('public/waitlist-clone/brand/logoland4.png');
let offset = 8, idatChunks = [], width = 2553, height = 945;
while (offset < buf.length) {
  const len = buf.readUInt32BE(offset);
  const type = buf.toString('ascii', offset + 4, offset + 8);
  if (type === 'IDAT') idatChunks.push(buf.subarray(offset + 8, offset + 8 + len));
  offset += 12 + len;
}
const decompressed = zlib.inflateSync(Buffer.concat(idatChunks));
const bpp = 4, stride = width * bpp, raw = Buffer.alloc(width * height * 4);
let srcPos = 0, dstPos = 0;
const paeth = (a, b, c) => {
  const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
};
for (let y = 0; y < height; y++) {
  const filterType = decompressed[srcPos++];
  for (let x = 0; x < stride; x++) {
    const rawVal = decompressed[srcPos++];
    const a = (x >= bpp) ? raw[dstPos - bpp] : 0;
    const b = (y > 0) ? raw[dstPos - stride] : 0;
    const c = (x >= bpp && y > 0) ? raw[dstPos - stride - bpp] : 0;
    let val = 0;
    if (filterType === 0) val = rawVal;
    else if (filterType === 1) val = (rawVal + a) & 0xff;
    else if (filterType === 2) val = (rawVal + b) & 0xff;
    else if (filterType === 3) val = (rawVal + Math.floor((a + b) / 2)) & 0xff;
    else if (filterType === 4) val = (rawVal + paeth(a, b, c)) & 0xff;
    raw[dstPos++] = val;
  }
}

// 2. Binary occupancy grid with downsampling = 2 for smooth contours
const s = 2, gw = Math.floor(width / s), gh = Math.floor(height / s);
const pw = gw + 2, ph = gh + 2;
const grid = new Uint8Array(pw * ph);
for (let y = 0; y < gh; y++) {
  for (let x = 0; x < gw; x++) {
    grid[(y + 1) * pw + (x + 1)] = raw[(y * s * width + x * s) * 4 + 3] > 80 ? 1 : 0;
  }
}

// 3. Find connected components
const labels = new Int32Array(pw * ph);
let currentLabel = 0;
const components = [];

for (let y = 1; y <= gh; y++) {
  for (let x = 1; x <= gw; x++) {
    if (grid[y * pw + x] === 1 && labels[y * pw + x] === 0) {
      currentLabel++;
      const queue = [[x, y]];
      labels[y * pw + x] = currentLabel;
      const pixels = [[x, y]];
      let minX = x, maxX = x, minY = y, maxY = y;
      while (queue.length > 0) {
        const [cx, cy] = queue.pop();
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;
        const neighbors = [[cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]];
        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < pw && ny >= 0 && ny < ph && grid[ny * pw + nx] === 1 && labels[ny * pw + nx] === 0) {
            labels[ny * pw + nx] = currentLabel;
            pixels.push([nx, ny]);
            queue.push([nx, ny]);
          }
        }
      }
      if (pixels.length > 100) {
        components.push({
          label: currentLabel,
          count: pixels.length,
          bounds: { minX, maxX, minY, maxY }
        });
      }
    }
  }
}

// Sort components from left to right (X position)
components.sort((a, b) => a.bounds.minX - b.bounds.minX);
console.log(`Identified ${components.length} character components:`);
components.forEach((c, idx) => {
  console.log(`  Char ${idx + 1}: label=${c.label}, pixels=${c.count}, bounds=[${c.bounds.minX * s}, ${c.bounds.minY * s}, ${c.bounds.maxX * s}, ${c.bounds.maxY * s}]`);
});

// 4. Moore-Neighbor Boundary Tracer
const DIRS = [
  [0, -1], [1, -1], [1, 0], [1, 1],
  [0, 1], [-1, 1], [-1, 0], [-1, -1]
];

function traceBoundary(targetLabel, startX, startY) {
  const boundary = [];
  let cx = startX, cy = startY;
  let dir = 0;
  
  let steps = 0;
  boundary.push([cx, cy]);
  
  while (steps++ < 20000) {
    let found = false;
    for (let i = 0; i < 8; i++) {
      const nd = (dir + i) % 8;
      const nx = cx + DIRS[nd][0];
      const ny = cy + DIRS[nd][1];
      if (nx >= 0 && nx < pw && ny >= 0 && ny < ph && labels[ny * pw + nx] === targetLabel) {
        cx = nx;
        cy = ny;
        dir = (nd + 5) % 8;
        boundary.push([cx, cy]);
        found = true;
        break;
      }
    }
    if (!found) break;
    if (cx === startX && cy === startY) break;
  }
  return boundary;
}

// 5. Ramer-Douglas-Peucker simplification
function rdp(pts, epsilon) {
  if (pts.length < 3) return pts;
  let maxDist = 0, index = 0;
  const [p1, p2] = [pts[0], pts[pts.length - 1]];
  const dx = p2[0] - p1[0], dy = p2[1] - p1[1];
  const lenSq = dx * dx + dy * dy;

  for (let i = 1; i < pts.length - 1; i++) {
    let d;
    if (lenSq === 0) {
      d = Math.hypot(pts[i][0] - p1[0], pts[i][1] - p1[1]);
    } else {
      const t = Math.max(0, Math.min(1, ((pts[i][0] - p1[0]) * dx + (pts[i][1] - p1[1]) * dy) / lenSq));
      const projX = p1[0] + t * dx;
      const projY = p1[1] + t * dy;
      d = Math.hypot(pts[i][0] - projX, pts[i][1] - projY);
    }
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }

  if (maxDist > epsilon) {
    const left = rdp(pts.slice(0, index + 1), epsilon);
    const right = rdp(pts.slice(index), epsilon);
    return left.slice(0, -1).concat(right);
  } else {
    return [p1, p2];
  }
}

function polygonArea(pts) {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1];
  }
  return area / 2;
}

// 6. Trace each component's boundary
const componentLoops = [];
for (const comp of components) {
  // Find top-leftmost pixel of this component
  let startX = -1, startY = -1;
  for (let y = comp.bounds.minY; y <= comp.bounds.maxY; y++) {
    for (let x = comp.bounds.minX; x <= comp.bounds.maxX; x++) {
      if (labels[y * pw + x] === comp.label) {
        startX = x;
        startY = y;
        break;
      }
    }
    if (startX !== -1) break;
  }
  
  const rawBoundary = traceBoundary(comp.label, startX, startY);
  const simplified = rdp(rawBoundary, 1.2);
  console.log(`Component ${comp.label}: raw ${rawBoundary.length} pts -> simplified ${simplified.length} pts`);
  componentLoops.push({
    pts: simplified.map(p => [(p[0] - 1) * s, (gh - (p[1] - 1)) * s]) // Cartesian (Y up)
  });
}

// 7. Find total bounding box
let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
for (const loop of componentLoops) {
  for (const p of loop.pts) {
    if (p[0] < minX) minX = p[0];
    if (p[0] > maxX) maxX = p[0];
    if (p[1] < minY) minY = p[1];
    if (p[1] > maxY) maxY = p[1];
  }
}

const totalW = maxX - minX;
const totalH = maxY - minY;
const targetWidth = 2.4; // 3D units width
const scaleFactor = targetWidth / totalW;
const cx = (minX + maxX) / 2;
const cy = (minY + maxY) / 2;

console.log(`Total width: ${totalW}px, Total height: ${totalH}px, Scale factor: ${scaleFactor}`);

// 8. Create THREE.Shape objects
const shapes = [];
for (const loop of componentLoops) {
  let pts = loop.pts.map(p => [(p[0] - cx) * scaleFactor, (p[1] - cy) * scaleFactor]);
  
  // Ensure counter-clockwise in Three.js coordinates
  if (polygonArea(pts) < 0) {
    pts.reverse();
  }
  
  const shape = new THREE.Shape();
  shape.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    shape.lineTo(pts[i][0], pts[i][1]);
  }
  shape.closePath();
  shapes.push(shape);
}

// 9. Extrude geometry with bevel
const extrudeSettings = {
  steps: 1,
  depth: 0.16,
  bevelEnabled: true,
  bevelThickness: 0.025,
  bevelSize: 0.018,
  bevelSegments: 3
};

const geometry = new THREE.ExtrudeGeometry(shapes, extrudeSettings);
geometry.center();
geometry.computeVertexNormals();

const material = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  metalness: 1.0,
  roughness: 0.35,
  envMapIntensity: 1.5
});

const mesh = new THREE.Mesh(geometry, material);
mesh.name = "Fonlio_3D_Wordmark";

const box = new THREE.Box3().setFromObject(mesh);
const size = box.getSize(new THREE.Vector3());
console.log('Final 3D Mesh bounding box:', size);

// 10. Export to GLB
const exportScene = new THREE.Scene();
exportScene.add(mesh);

const exporter = new GLTFExporter();
const gltf = await exporter.parseAsync(exportScene, { binary: true });
const glbBuffer = Buffer.from(gltf);

fs.writeFileSync('public/waitlist-clone/home/hero/logo-ximitech.glb', glbBuffer);
fs.writeFileSync('public/waitlist-clone/home/hero/logo-fonlio.glb', glbBuffer);
console.log(`Successfully generated and exported logo-ximitech.glb and logo-fonlio.glb (${glbBuffer.length} bytes)!`);
