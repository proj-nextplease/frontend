import fs from 'fs';

const filePath = 'public/waitlist-clone/assets/home-xt2.js';
let code = fs.readFileSync(filePath, 'utf8');

// 1. WebGL clear color: #070a0f
code = code.replace(/h\.setClearColor\(`#[0-9a-fA-F]+`\)/, 'h.setClearColor(`#070a0f`)');

// 2. Procedural neon equirectangular canvas texture
const neonCanvasSnippet = `(()=>{
  let c = document.createElement("canvas");
  c.width = 2048; c.height = 1024;
  let x = c.getContext("2d");
  x.fillStyle = "#070a0f";
  x.fillRect(0, 0, 2048, 1024);
  let g = x.createRadialGradient(1024, 512, 10, 1024, 512, 850);
  g.addColorStop(0, "rgba(210, 255, 77, 0.98)");
  g.addColorStop(0.18, "rgba(185, 255, 0, 0.92)");
  g.addColorStop(0.38, "rgba(16, 185, 129, 0.70)");
  g.addColorStop(0.58, "rgba(45, 212, 191, 0.42)");
  g.addColorStop(0.80, "rgba(6, 78, 59, 0.18)");
  g.addColorStop(1, "rgba(7, 10, 15, 0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 2048, 1024);
  let g2 = x.createRadialGradient(500, 400, 10, 500, 400, 700);
  g2.addColorStop(0, "rgba(45, 212, 191, 0.35)");
  g2.addColorStop(1, "rgba(7, 10, 15, 0)");
  x.fillStyle = g2;
  x.fillRect(0, 0, 2048, 1024);
  return c.toDataURL("image/png");
})()`;

// Replace D=await a.loadAsync(...)
code = code.replace(
  /D=await a\.loadAsync\([^)]+\)/,
  `D=await a.loadAsync(${neonCanvasSnippet})`
);

// 3. Make text-name-xt.webp load a 1x1 transparent data URL
const transparentDataUrl = `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAA"`;
code = code.replace(
  'path:`${f.textureRoot}/texts/text-name-xt.webp`',
  `path:${transparentDataUrl}`
);

// 4. Hide ximitech text in initialization
code = code.replace(
  'Oe(),he.material.opacity=1,Ce.material.opacity=0,we.material.opacity=0;',
  'Oe(),he.visible=!1,he.material.opacity=0,Ce.material.opacity=0,we.material.opacity=0;'
);

// 5. Keep ximitech text hidden in animation loop Ie
code = code.replace(
  'he.material.opacity=n,Ce.material.opacity=r,we.material.opacity=r',
  'he.visible=!1,he.material.opacity=0,Ce.material.opacity=r,we.material.opacity=r'
);

// 6. Shader adjustments for neon aesthetic
code = code.replace(
  'vec3 rippleGlowColor = vec3(0.80, 0.95, 1.0);',
  'vec3 rippleGlowColor = vec3(0.725, 1.0, 0.0);'
);

code = code.replace(
  'vec3 glassTint = vec3(0.90, 0.95, 1);',
  'vec3 glassTint = vec3(0.85, 1.0, 0.7);'
);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully patched home-xt2.js with procedural neon canvas & transparent text!');
