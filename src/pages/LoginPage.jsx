import { supabase } from '../services/supabaseClient.js';

export function LoginPage() {
  const isSupabaseConfigured = Boolean(supabase);

  return (
    <section className="auth-page">
      <div>
        <p className="eyebrow">Supabase Auth</p>
        <h1>Login flow placeholder</h1>
        <p>
          The frontend will use Supabase for authentication and send access tokens to the
          Spring Boot API. Trust-critical writes still go through the backend.
        </p>
      </div>
      <div className="status-panel">
        <strong>{isSupabaseConfigured ? 'Supabase env detected' : 'Supabase env missing'}</strong>
        <span>Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`.</span>
      </div>
    </section>
  );
}
