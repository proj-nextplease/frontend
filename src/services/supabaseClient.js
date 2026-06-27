import { createClient } from '@supabase/supabase-js';
import { REMEMBER_KEY } from '../lib/authStorage.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Storage adapter that routes Supabase's persisted session to localStorage
 * (remember = on, default) or sessionStorage (remember = off, tab-scoped),
 * based on the `nextplease:remember` flag. The flag is read on every call, so
 * the choice made at login time takes effect immediately.
 */
const rememberAwareStorage = {
  getItem(key) {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  },
  setItem(key, value) {
    const remember = localStorage.getItem(REMEMBER_KEY) !== 'false';
    const primary = remember ? localStorage : sessionStorage;
    const secondary = remember ? sessionStorage : localStorage;
    primary.setItem(key, value);
    secondary.removeItem(key);
  },
  removeItem(key) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: rememberAwareStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
