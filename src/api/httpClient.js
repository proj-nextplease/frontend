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
