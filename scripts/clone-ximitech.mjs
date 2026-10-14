import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetDir = path.resolve(__dirname, '../public/waitlist-clone');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const BASE_URL = 'https://lab1.ximitech.vn';

function downloadWithCurl(relPath) {
  const url = `${BASE_URL}/${relPath.replace(/^\//, '')}`;
  const outPath = path.join(targetDir, relPath);
  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  try {
    execSync(`curl -s -L -f -o "${outPath}" "${url}"`, { stdio: 'ignore' });
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 0) {
      console.log(`[OK] Saved ${relPath} (${fs.statSync(outPath).size} bytes)`);
      return true;
    }
  } catch (err) {
    console.warn(`[WARN] Failed curl for ${url}`);
  }
  return false;
}

const assets = [
  'assets/home-xt2.js',
  'assets/home-xt2.css',
  'assets/ximitech.css',
  'assets/fonts-vi.css',
  'assets/ScrollTrigger-Or8JzwiZ.js',
  'assets/setupCrossPageTransitions-xt2.js',
  'assets/setupCrossPageTransitions-D60GSfRM.css',
  'assets/setupHeaderVisibility-D-FHk4jp.js',
  'assets/setupHeaderVisibility-fOJvfYOR.css',
  'assets/three.module-fBMLdKIM.js',
  'assets/Observer-C5OqvjuH.js',
  'assets/chunk-Deb1DmFP.js',
  'assets/ximitech-sound.js',
  'assets/createImageDistortionScene-C3VU7ZZE.js',
  'assets/createImageDistortionScene-DryuzL4t.js',
  'assets/matter-D640oHn0.js',
  // Fonts
  'assets/Satoshi-Regular-CAdxhaPe.woff2',
  'assets/Satoshi-Medium-GkA34YXu.woff2',
  'assets/Satoshi-MediumItalic-BwwtClOB.woff2',
  'assets/Satoshi-Bold-CT_TuBnL.woff2',
  'assets/Satoshi-Variable-ChAXbpFa.ttf',
  'assets/Satoshi-VariableItalic-Bb7sdEFv.ttf',
  'assets/CabinetGrotesk-Thin-D4W8aEVO.woff2',
  'assets/CabinetGrotesk-Regular-BLnZls-E.woff2',
  'assets/CabinetGrotesk-Medium-eM6zIJLo.woff2',
  'assets/CabinetGrotesk-Bold-ChXdH3YW.woff2',
  'assets/CabinetGrotesk-Variable-BZl-SSEF.woff2',
  // SVGs and images
  'brand/logo-ximitech.svg',
  'brand/favicon.ico',
  'brand/apple-touch-icon.png',
  'home/trajectory/background.webp',
  'shared/footer/background.webp',
  'home/toolkit/frontend/vi/javascript.svg',
  'home/toolkit/frontend/vi/react.svg',
  'home/toolkit/frontend/vi/nextjs.svg',
  'home/toolkit/frontend/vi/vuejs.svg',
  'home/toolkit/frontend/vi/threejs.svg',
  'home/toolkit/frontend/vi/gsap.svg',
  'home/toolkit/frontend/vi/glsl.svg',
  'home/toolkit/frontend/vi/webflow.svg',
  'home/toolkit/frontend/vi/shopify.svg',
  'home/toolkit/art-direction/vi/figma.svg',
  'home/toolkit/art-direction/vi/photoshop.svg',
  'home/toolkit/art-direction/vi/illustrator.svg',
  'home/toolkit/art-direction/vi/indesign.svg',
  'home/toolkit/art-direction/vi/aftereffects.svg',
  'home/toolkit/art-direction/vi/capcut.svg',
  'home/toolkit/art-direction/vi/lightroom.svg',
];

console.log(`Downloading ${assets.length} assets with curl...`);
for (const a of assets) {
  downloadWithCurl(a);
}
console.log('Download complete!');
