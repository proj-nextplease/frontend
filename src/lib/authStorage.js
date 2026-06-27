/**
 * Centralized auth storage with a "remember me" (Giữ đăng nhập) flag.
 *
 * The flag itself always lives in localStorage so it survives a restart and can
 * be read before any session exists. When remember = true, the session/token is
 * persisted in localStorage (survives browser restart); when false, in
 * sessionStorage (cleared when the tab closes).
 *
 * Default (flag absent) = remember ON, matching Supabase's own default and the
 * decision that candidates stay logged in by default.
 */

export const REMEMBER_KEY = 'nextplease:remember';
const TOKEN_KEY = 'nextplease:access_token';
const USER_KEY = 'nextplease:current_user';
export const LAST_EMAIL_KEY = 'nextplease:last_email';

export function isRemember() {
  return localStorage.getItem(REMEMBER_KEY) !== 'false';
}

/** Persist the remember choice. Call this BEFORE establishing the session. */
export function setRemember(remember) {
  localStorage.setItem(REMEMBER_KEY, remember ? 'true' : 'false');
}

/** The storage the current remember choice maps to. */
function primaryStore() {
  return isRemember() ? localStorage : sessionStorage;
}
function secondaryStore() {
  return isRemember() ? sessionStorage : localStorage;
}

/** Read a value from whichever storage currently holds it. */
function read(key) {
  return primaryStore().getItem(key) ?? secondaryStore().getItem(key);
}

/** Write to the chosen storage and clear any stale copy in the other. */
function write(key, value) {
  primaryStore().setItem(key, value);
  secondaryStore().removeItem(key);
}

function remove(key) {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
}

export function getStoredToken() {
  return read(TOKEN_KEY);
}
export function setStoredToken(token) {
  if (token) write(TOKEN_KEY, token);
}

export function getStoredUser() {
  const raw = read(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
export function setStoredUser(user) {
  if (user) write(USER_KEY, JSON.stringify(user));
}

/** Remember the last email used to log in (low-risk, for prefill). */
export function getLastEmail() {
  return localStorage.getItem(LAST_EMAIL_KEY) || '';
}
export function rememberLastEmail(email) {
  if (email) localStorage.setItem(LAST_EMAIL_KEY, email.trim());
}

/** Clear all auth state from both storages (token + cached user + bypass). */
export function clearStoredAuth() {
  remove(TOKEN_KEY);
  remove(USER_KEY);
  remove('nextplease:admin-bypass');
}
