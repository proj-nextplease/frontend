import axios from 'axios';
import { supabase } from '../services/supabaseClient.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use(async (config) => {
  let accessToken = null;

  // 1. Prioritize explicitly stored token from BE login (freshest, most reliable)
  accessToken = sessionStorage.getItem('nextplease:access_token');

  // 2. Fall back to Supabase session (for candidate flow where supabase manages auth)
  if (!accessToken && supabase) {
    const { data } = await supabase.auth.getSession();
    accessToken = data.session?.access_token ?? null;
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
            sessionStorage.setItem('nextplease:access_token', newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return httpClient(originalRequest);
          }
        } catch {
          // refresh failed – fall through to reject
        }
      }

      // Refresh failed or Supabase not configured – clear stale auth
      sessionStorage.removeItem('nextplease:access_token');
    }

    const beMessage = error.response?.data?.message;
    if (beMessage) {
      error.message = beMessage;
    }
    return Promise.reject(error);
  }
);
