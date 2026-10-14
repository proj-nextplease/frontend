import fs from 'fs';

// 1. Patch public/waitlist-clone/assets/setupCrossPageTransitions-xt2.js
const jsPath = 'public/waitlist-clone/assets/setupCrossPageTransitions-xt2.js';
let jsCode = fs.readFileSync(jsPath, 'utf8');

// Enable HTML rendering in translations if content contains HTML tags
jsCode = jsCode.replace(
  'e.querySelectorAll(`[data-i18n]`).forEach(e=>{e.textContent=r(e.dataset.i18n)})',
  'e.querySelectorAll(`[data-i18n]`).forEach(e=>{let v=r(e.dataset.i18n);v.includes("<")?e.innerHTML=v:e.textContent=v})'
);

// Update VI trajectoryTitle to include stylized FONLIO wordmark
jsCode = jsCode.replace(
  'trajectoryTitle:`Cách FONLIO vận hành`',
  'trajectoryTitle:`Cách <span class="fonlio-heading-wordmark">FONLIO</span> vận hành`'
);

// Update EN trajectoryTitle
jsCode = jsCode.replace(
  'trajectoryTitle:`Our journey`',
  'trajectoryTitle:`How <span class="fonlio-heading-wordmark">FONLIO</span> works`'
);

// Update VI trajectorySentence6 with Logo image
jsCode = jsCode.replace(
  'trajectorySentence5:`Hôm nay`,trajectorySentence6:`FONLIO`',
  'trajectorySentence5:`Hôm nay`,trajectorySentence6:`<img src="/waitlist-clone/brand/logoland4.png" alt="FONLIO" class="fonlio-trajectory-logo-img" />`'
);

// Update EN trajectorySentence6 with Logo image
jsCode = jsCode.replace(
  'trajectorySentence5:`Today`,trajectorySentence6:`FONLIO`',
  'trajectorySentence5:`Today`,trajectorySentence6:`<img src="/waitlist-clone/brand/logoland4.png" alt="FONLIO" class="fonlio-trajectory-logo-img" />`'
);

fs.writeFileSync(jsPath, jsCode, 'utf8');
console.log('Successfully patched setupCrossPageTransitions-xt2.js!');

// 2. Patch public/waitlist-clone/index.html
const htmlPath = 'public/waitlist-clone/index.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// Replace Intro X logo with Fonlio brand logo
const oldIntroSvgRegex = /<svg class="ximi-intro__logo"[\s\S]*?<\/svg>/;
html = html.replace(
  oldIntroSvgRegex,
  `<div class="ximi-intro__logo-wrap">
          <img src="/waitlist-clone/brand/logoland4.png" alt="FONLIO" class="ximi-intro__brand-logo" />
        </div>`
);

// Remove sound toggle
html = html.replace(
  /<!-------- SOUND TOGGLE -------->[\s\S]*?<\/button>/,
  '<!-------- SOUND TOGGLE (REMOVED) -------->'
);

// Remove lab-badge
html = html.replace(
  /<!-- Nhãn báo đây là trang demo, dẫn khách về website chính -->[\s\S]*?<\/aside>/,
  '<!-- Nhãn demo đã loại bỏ theo yêu cầu -->'
);

// Update heading at line 622
html = html.replace(
  '<h2 class="title" data-i18n="home.trajectoryTitle">Cách chúng tôi làm</h2>',
  '<h2 class="title" data-i18n="home.trajectoryTitle">Cách <span class="fonlio-heading-wordmark">FONLIO</span> vận hành</h2>'
);

html = html.replace(
  '<h2 class="title" data-i18n="home.trajectoryTitle">Cách FONLIO vận hành</h2>',
  '<h2 class="title" data-i18n="home.trajectoryTitle">Cách <span class="fonlio-heading-wordmark">FONLIO</span> vận hành</h2>'
);

// Update trajectorySentence6 at line 665
html = html.replace(
  /<div\s+class="trajectory-sentences__sentence is-dialogue"\s+data-i18n="home.trajectorySentence6">\s*FONLIO\s*<\/div>/,
  `<div class="trajectory-sentences__sentence is-dialogue fonlio-dialogue-logo" data-i18n="home.trajectorySentence6"><img src="/waitlist-clone/brand/logoland4.png" alt="FONLIO" class="fonlio-trajectory-logo-img" /></div>`
);

// Remove playground link in next-section (image 5)
html = html.replace(
  /<a\s+class="next-section__playground-link playground-link"[\s\S]*?<\/a>/,
  '<!-- Playground link removed -->'
);

// Add Comprehensive Dark Mode & Typography Styles before </style>
const customCss = `
/* ==========================================================================
   FONLIO DARK THEME & USER CUSTOMIZATIONS
   ========================================================================== */
:root {
  --color-dark: #070a0f !important;
  --color-cream: #070a0f !important;
  --color-accent: #b9ff00 !important;
  --color-accent-soft: #0e141d !important;
  --lab-bg: #070a0f !important;
}

body {
  background-color: #070a0f !important;
  color: #ffffff !important;
}

/* 1. HIDE IMAGE 1 ELEMENTS */
.lab-badge,
.sound-toggle {
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
  opacity: 0 !important;
}

/* 2. HIDE IMAGE 5 ELEMENT */
.next-section__playground-link,
.playground-link {
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
  opacity: 0 !important;
}

/* 3. HARD REFRESH INTRO FONLIO LOGO */
.ximi-intro {
  background: #070a0f !important;
}
.ximi-intro__glow {
  background: radial-gradient(circle, rgba(185, 255, 0, 0.28) 0%, rgba(45, 212, 191, 0.12) 40%, rgba(7, 10, 15, 0) 70%) !important;
}
.ximi-intro__logo-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}
.ximi-intro__brand-logo {
  width: clamp(160px, 20vw, 260px);
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 0 24px rgba(185, 255, 0, 0.85)) drop-shadow(0 0 55px rgba(45, 212, 191, 0.45));
  animation: fonlio-intro-pulse 1.4s cubic-bezier(0.22, 1, 0.36, 1) infinite alternate;
}
@keyframes fonlio-intro-pulse {
  0% { transform: scale(0.96); filter: drop-shadow(0 0 18px rgba(185, 255, 0, 0.6)) drop-shadow(0 0 35px rgba(45, 212, 191, 0.3)); }
  100% { transform: scale(1.04); filter: drop-shadow(0 0 30px rgba(185, 255, 0, 0.95)) drop-shadow(0 0 65px rgba(45, 212, 191, 0.6)); }
}
.ximi-intro__word {
  color: #ffffff !important;
  letter-spacing: 0.2em !important;
  font-family: CabinetGrotesk-Variable, sans-serif !important;
  font-weight: 800 !important;
}
.ximi-intro__tagline {
  color: #34d399 !important;
  letter-spacing: 0.12em !important;
  font-size: 13px !important;
  text-transform: uppercase !important;
}

/* 4. IMAGE 2: HEADING WORDMARK STYLING */
.fonlio-heading-wordmark {
  font-family: CabinetGrotesk-Bold, CabinetGrotesk-Variable, Arial, sans-serif !important;
  font-weight: 900 !important;
  letter-spacing: 0.05em !important;
  text-transform: uppercase !important;
  color: #b9ff00 !important;
  text-shadow: 0 0 24px rgba(185, 255, 0, 0.6), 0 0 45px rgba(45, 212, 191, 0.3) !important;
  display: inline-block !important;
}

/* 5. IMAGE 3: TRAJECTORY DIALOGUE LOGO */
.fonlio-dialogue-logo {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}
.fonlio-trajectory-logo-img {
  height: clamp(54px, 7.5vw, 96px) !important;
  width: auto !important;
  max-width: 85vw !important;
  object-fit: contain !important;
  vertical-align: middle !important;
  filter: drop-shadow(0 0 22px rgba(185, 255, 0, 0.8)) drop-shadow(0 0 48px rgba(45, 212, 191, 0.4)) !important;
}

/* 6. DARK THEME SECTIONS */
.manifesto {
  background-color: #070a0f !important;
  color: #ffffff !important;
}
.manifesto .text {
  color: rgba(255, 255, 255, 0.92) !important;
}
.trajectory {
  background-color: #070a0f !important;
  color: #ffffff !important;
}
.trajectory .entry .title {
  color: #ffffff !important;
}
.trajectory-sentences__container {
  background-color: #070a0f !important;
}
.trajectory-sentences__sentence {
  color: #ffffff !important;
}
.projects {
  background-color: #070a0f !important;
}
.projects__container {
  background-color: #0a0e16 !important;
  color: #ffffff !important;
  border-top: 1px solid rgba(185, 255, 0, 0.12) !important;
  border-bottom: 1px solid rgba(185, 255, 0, 0.12) !important;
}
.projects__title {
  color: #ffffff !important;
}
.projects__link {
  color: rgba(255, 255, 255, 0.76) !important;
  transition: color 0.3s ease, text-shadow 0.3s ease !important;
}
.projects__link:hover {
  color: #b9ff00 !important;
  text-shadow: 0 0 20px rgba(185, 255, 0, 0.6) !important;
}
.next-section {
  background-color: #070a0f !important;
  color: #ffffff !important;
}
.next-section__container {
  background-color: #070a0f !important;
}
.next-section__intro {
  color: #ffffff !important;
}
.next-section__text {
  fill: #131b24 !important;
}
`;

html = html.replace('</style>', `${customCss}\n</style>`);
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Successfully patched index.html with dark theme, logo enhancements, and hidden sections!');
