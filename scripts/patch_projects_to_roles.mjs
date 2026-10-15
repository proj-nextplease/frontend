import fs from 'fs';

// 1. Update setupCrossPageTransitions-xt2.js
const jsPath = 'public/waitlist-clone/assets/setupCrossPageTransitions-xt2.js';
let js = fs.readFileSync(jsPath, 'utf8');

js = js.replace(
  'projectsTitle:`Dự án mẫu`',
  'projectsTitle:`Lĩnh vực & Living Portfolio`'
);

js = js.replace(
  'projectsTitle:`Projects`',
  'projectsTitle:`Specializations & Living Portfolios`'
);

fs.writeFileSync(jsPath, js, 'utf8');
console.log('Updated projectsTitle in setupCrossPageTransitions-xt2.js!');

// 2. Update public/waitlist-clone/index.html
const htmlPath = 'public/waitlist-clone/index.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// Replace projects title
html = html.replace(
  '<h2 class="projects__title" data-i18n="home.projectsTitle">Dự án</h2>',
  '<h2 class="projects__title" data-i18n="home.projectsTitle">Lĩnh vực &amp; Living Portfolio</h2>'
);

// Replace projects list with 12 student specializations
const oldListRegex = /<nav class="projects__list"[\s\S]*?<\/nav>/;
const newRolesList = `<nav class="projects__list" aria-label="Lĩnh vực &amp; Living Portfolio" data-i18n-attr="aria-label:home.navigationProjects">
              <a
                class="projects__link"
                href="#contact"
                data-project="ppf-dong-nai"
              >
                product designer
              </a>

              <a
                class="projects__link"
                href="#contact"
                data-project="hqn-group"
              >
                fullstack engineer
              </a>

              <a
                class="projects__link"
                href="#contact"
                data-project="engmind-study"
              >
                ai &amp; data specialist
              </a>

              <a
                class="projects__link"
                href="#contact"
                data-project="lumine-cloud"
              >
                ui/ux researcher
              </a>

              <a
                class="projects__link"
                href="#contact"
                data-project="tcs-global"
              >
                growth marketer
              </a>

              <a
                class="projects__link"
                href="#contact"
                data-project="hoc-nghe-truc-tuyen"
              >
                brand &amp; visual artist
              </a>

              <a
                class="projects__link"
                href="#contact"
                data-project="dastin-hullor"
              >
                fintech developer
              </a>

              <a
                class="projects__link"
                href="#contact"
                data-project="raymoire"
              >
                content creator &amp; media
              </a>

              <a
                class="projects__link"
                href="#contact"
                data-project="jk-florist"
              >
                business development
              </a>

              <a
                class="projects__link"
                href="#contact"
                data-project="aplus-billiards"
              >
                mobile app engineer
              </a>

              <a
                class="projects__link"
                href="#contact"
                data-project="court-vision"
              >
                cybersecurity analyst
              </a>

              <a
                class="projects__link"
                href="#contact"
                data-project="propfirm-edge"
              >
                creative director
              </a>
            </nav>`;

html = html.replace(oldListRegex, newRolesList);
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Updated projects section to student specializations in index.html!');
