# Environment Setup

## Required Supabase Values

Create a Supabase project first. Then collect:

- Project URL: Supabase Dashboard -> Project Settings -> API.
- Anon/public key: Supabase Dashboard -> Project Settings -> API.

The anon key is public and may be used by the frontend. Never put the service role key in frontend code, Vercel frontend variables, or Git.

## Local Development

Create `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Run:

```bash
npm install
npm run dev
```

## Vercel

Add the same variables in Vercel Project Settings -> Environment Variables:

```env
VITE_API_BASE_URL=https://your-railway-public-domain.up.railway.app/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

After changing Vercel environment variables, redeploy the frontend.

## Supabase Auth Redirect URLs

In Supabase Auth URL configuration, add:

- Local frontend URL: `http://localhost:5173`
- Production frontend URL: the Vercel production domain.
- Preview URLs if Vercel preview auth flows will be tested.
