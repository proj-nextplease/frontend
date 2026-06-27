import { ROLES } from '../config/roles.js';
import { supabase } from '../services/supabaseClient.js';
import { getStoredToken, getStoredUser } from './authStorage.js';

/** Decode the `app_metadata.roles` array out of a Supabase JWT. Returns [] on any failure. */
function rolesFromToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return [];
    const payload = JSON.parse(atob(parts[1]));
    const roles = payload.app_metadata?.roles;
    return Array.isArray(roles) ? roles : [];
  } catch {
    return [];
  }
}

/**
 * Resolve the current user's roles from the freshest source available:
 *   1. The BE-issued token in sessionStorage (business/admin flow)
 *   2. The active Supabase session (candidate flow)
 *   3. The cached `nextplease:current_user` payload (fallback when the JWT
 *      predates the app_metadata role sync — roles only land in the token
 *      after the first login).
 */
export async function getCurrentRoles() {
  const storedToken = getStoredToken();
  if (storedToken) {
    const roles = rolesFromToken(storedToken);
    if (roles.length) return roles;
  }

  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (token) {
        const roles = rolesFromToken(token);
        if (roles.length) return roles;
      }
    } catch {
      // ignore – fall through to cached user
    }
  }

  const cachedUser = getStoredUser();
  if (Array.isArray(cachedUser?.roles)) return cachedUser.roles;

  return [];
}

export function isAdmin(roles) {
  return roles.includes(ROLES.ADMIN);
}

export function isBusiness(roles) {
  return (
    roles.includes(ROLES.EMPLOYER_FREE) ||
    roles.includes(ROLES.EMPLOYER_PREMIUM) ||
    roles.includes(ROLES.ORGANIZER)
  );
}

export function isCandidate(roles) {
  return (
    roles.includes(ROLES.CANDIDATE_FREE) ||
    roles.includes(ROLES.CANDIDATE_PREMIUM)
  );
}
