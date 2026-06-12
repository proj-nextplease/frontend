# Next Please Frontend

React JavaScript frontend for Next Please, a web-first gamified reputation infrastructure and hyperlocal talent marketplace for Gen Z students.

## Tech Stack

- React JavaScript
- Vite
- React Router
- Supabase Auth client
- Axios API client
- Vercel deployment target

## Development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in the Supabase and backend API values.

## Environment Variables

- `VITE_API_BASE_URL`: Spring Boot API base URL.
- `VITE_SUPABASE_URL`: Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`: Supabase anon public key.

## Architecture Notes

- Frontend handles Supabase sign-in/session UX.
- Frontend sends Supabase access tokens to the backend API.
- Frontend must not calculate or mutate Reputation Score, EXP, NP balance, Premium status, verification outcomes, or payment state.
- Trust-critical values are displayed from backend API responses only.

## Git Workflow

- Work on `main` for small setup and documentation changes.
- Create a feature or fix branch for larger features, experiments, and bug fixes.
- Merge back into `main` after testing.
- Run `npm run update-readme` before pushing when project structure changes.
- A GitHub Action can automate README structure updates after the GitHub token has `workflow` scope.

## Project Structure

<!-- PROJECT_STRUCTURE_START -->
```text
.
+- .env.example
+- .gitignore
+- eslint.config.js
+- index.html
+- package-lock.json
+- package.json
+- README.md
+- scripts/
  - scripts/update-readme-structure.mjs
+- src/
  - src/api/
    - src/api/healthApi.js
    - src/api/httpClient.js
  - src/App.jsx
  - src/components/
    - src/components/layout/
      - src/components/layout/AppLayout.jsx
      - src/components/layout/Header.jsx
    - src/components/ui/
      - src/components/ui/MetricCard.jsx
  - src/config/
    - src/config/roles.js
  - src/lib/
    - src/lib/formatters.js
  - src/main.jsx
  - src/pages/
    - src/pages/HomePage.jsx
    - src/pages/LoginPage.jsx
    - src/pages/NotFoundPage.jsx
  - src/routes/
    - src/routes/AppRouter.jsx
  - src/services/
    - src/services/supabaseClient.js
  - src/styles/
    - src/styles/index.css
+- vite.config.js
```
<!-- PROJECT_STRUCTURE_END -->
