import axios from 'axios';
import { supabase } from '../services/supabaseClient.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';
const ACCESS_TOKEN_KEY = 'nextplease:access_token';

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Keep the cached token in sync with Supabase's own session lifecycle.
// Supabase auto-refreshes its access token in the background; without this
// listener the sessionStorage copy would go stale and every request would
// send an expired token until it hit a 401. Business/admin (BE-login) flows
// also call supabase.auth.setSession at login, so they benefit too.
if (supabase) {
  supabase.auth.onAuthStateChange((event, session) => {
    if (session?.access_token) {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, session.access_token);
    } else if (event === 'SIGNED_OUT') {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  });
}

httpClient.interceptors.request.use(async (config) => {
  let accessToken = null;

  // 1. Prefer the live Supabase session — getSession() returns an
  //    auto-refreshed token, so it's the freshest source when available.
  //    Mirror it into sessionStorage so the fallback stays current.
  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      accessToken = data.session?.access_token ?? null;
      if (accessToken) {
        sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      }
    } catch {
      // ignore – fall back to the stored token below
    }
  }

  // 2. Fall back to the explicitly stored token (BE-login flows where Supabase
  //    isn't managing the session, e.g. Supabase not configured).
  if (!accessToken) {
    accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// Extract BE error message from 4xx/5xx responses.
// On 401, attempt a single Supabase session refresh before giving up.
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only retry once, and only for 401 (Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retried) {
      originalRequest._retried = true;

      // Try refreshing the Supabase session to get a new access token
      if (supabase) {
        try {
          const { data, error: refreshError } = await supabase.auth.refreshSession();
          if (!refreshError && data.session?.access_token) {
            const newToken = data.session.access_token;
            sessionStorage.setItem(ACCESS_TOKEN_KEY, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return httpClient(originalRequest);
          }
        } catch {
          // refresh failed – fall through to reject
        }
      }

      // Refresh failed or Supabase not configured – the session is dead. Clear
      // stale auth so guards bounce the user back to the appropriate login.
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      sessionStorage.removeItem('nextplease:current_user');
    }

    const beMessage = error.response?.data?.message;
    if (beMessage) {
      error.message = beMessage;
    }
    return Promise.reject(error);
  }
);

/**
 * Sign the current user out everywhere: revoke the Supabase session (which
 * invalidates the refresh token server-side) and clear the cached BE token.
 * Use this for all logout buttons so business/admin sessions are torn down
 * cleanly rather than lingering until expiry.
 */
export async function logout() {
  // Best-effort server-side revoke + audit (needs the token, so do it first).
  try {
    await httpClient.post('/auth/logout');
  } catch {
    // ignore – proceed to clear local state regardless
  }
  try {
    if (supabase) {
      await supabase.auth.signOut();
    }
  } finally {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem('nextplease:current_user');
    sessionStorage.removeItem('nextplease:admin-bypass');
  }
}
