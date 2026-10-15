import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, getPixel) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    raw[pos++] = 0; // Filter none
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      raw[pos++] = r;
      raw[pos++] = g;
      raw[pos++] = b;
      raw[pos++] = a;
    }
  }
  const idatData = zlib.deflateSync(raw, { level: 9 });
  
  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }
  
  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }
  
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bit
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  
  const chunks = [
    header,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idatData),
    makeChunk('IEND', Buffer.alloc(0))
  ];
  return Buffer.concat(chunks);
}

// 1. Transparent 1x1 for text-name-xt.webp
const transparent1x1 = createPNG(1, 1, () => [0, 0, 0, 0]);
fs.writeFileSync('public/waitlist-clone/home/hero/textures/desktop/texts/text-name-xt.webp', transparent1x1);
fs.writeFileSync('public/waitlist-clone/home/hero/textures/mobile/texts/text-name-xt.webp', transparent1x1);
console.log('Replaced text-name-xt.webp with transparent placeholder');

// 2. Generate Neon Gradient Equirectangular Map
// Let's create 1024 x 512 map for fast generation & crisp display
const W = 1024, H = 512;
// Palette:
// INK: [7, 10, 15]
// NEON_LIME: [185, 255, 0]
// LIME_BRIGHT: [210, 255, 77]
// EMERALD: [16, 185, 129]
// TEAL: [45, 212, 191]

const neonGradient = createPNG(W, H, (x, y) => {
  // Center is at (W/2, H/2)
  const cx = W * 0.5;
  const cy = H * 0.5;
  const dx = (x - cx) / (W * 0.5);
  const dy = (y - cy) / (H * 0.5);
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Base dark ink
  let r = 7, g = 10, b = 15;

  // Main neon bloom at center
  if (dist < 1.0) {
    const t = dist; // 0 at center, 1 at edge
    // Spline interpolation
    let factor = Math.max(0, 1 - t * t);
    
    // Core highlight
    let nr, ng, nb;
    if (t < 0.2) {
      const u = t / 0.2;
      nr = 210 * (1 - u) + 185 * u;
      ng = 255 * (1 - u) + 255 * u;
      nb = 77 * (1 - u) + 0 * u;
    } else if (t < 0.45) {
      const u = (t - 0.2) / 0.25;
      nr = 185 * (1 - u) + 16 * u;
      ng = 255 * (1 - u) + 185 * u;
      nb = 0 * (1 - u) + 129 * u;
    } else if (t < 0.75) {
      const u = (t - 0.45) / 0.30;
      nr = 16 * (1 - u) + 45 * u;
      ng = 185 * (1 - u) + 212 * u;
      nb = 129 * (1 - u) + 191 * u;
    } else {
      const u = (t - 0.75) / 0.25;
      nr = 45 * (1 - u) + 7 * u;
      ng = 212 * (1 - u) + 10 * u;
      nb = 191 * (1 - u) + 15 * u;
    }

    r = Math.round(r * (1 - factor) + nr * factor);
    g = Math.round(g * (1 - factor) + ng * factor);
    b = Math.round(b * (1 - factor) + nb * factor);
  }

  // Secondary teal accent at (0.2 * W, 0.4 * H)
  const tdx = (x - W * 0.2) / (W * 0.4);
  const tdy = (y - H * 0.4) / (H * 0.4);
  const tdist = Math.sqrt(tdx * tdx + tdy * tdy);
  if (tdist < 1.0) {
    const tfactor = Math.max(0, (1 - tdist) * 0.35);
    r = Math.round(r * (1 - tfactor) + 45 * tfactor);
    g = Math.round(g * (1 - tfactor) + 212 * tfactor);
    b = Math.round(b * (1 - tfactor) + 191 * tfactor);
  }

  return [Math.min(255, r), Math.min(255, g), Math.min(255, b), 255];
});

fs.writeFileSync('public/waitlist-clone/home/hero/textures/desktop/scene-gradient.webp', neonGradient);
fs.writeFileSync('public/waitlist-clone/home/hero/textures/mobile/scene-gradient.webp', neonGradient);
console.log(`Saved neon gradient textures (${neonGradient.length} bytes) to desktop and mobile!`);
