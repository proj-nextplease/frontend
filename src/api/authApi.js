import { httpClient } from './httpClient.js';
import { supabase } from '../services/supabaseClient.js';

export async function loginCandidate(email, password) {
  const response = await httpClient.post('/auth/login', { email, password });
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Đăng nhập thất bại.');
  }
  return response.data.data;
}

/**
 * Sends a password-reset email via Supabase. The link lands the user on
 * /reset-password where they choose a new password. Shared by candidate and
 * business flows (both are Supabase users). Admin has no self-service reset.
 *
 * Resolves to `true` whether or not the email exists — callers must show an
 * ambiguous message ("nếu email tồn tại...") to avoid account enumeration.
 */
export async function requestPasswordReset(email, role = 'candidate') {
  if (!supabase) {
    // Dev mode without Supabase configured – nothing to send.
    return true;
  }
  // Carry the role through so the reset page can route back to the right login.
  const redirectTo = `${window.location.origin}/reset-password?role=${encodeURIComponent(role)}`;
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo,
  });
  if (error) {
    // Swallow provider errors so we never leak whether the email is registered;
    // genuine config errors are still logged for the developer.
    console.warn('resetPasswordForEmail error (suppressed for UX):', error.message);
  }
  return true;
}

/**
 * Sets a new password for the user in the active (recovery) Supabase session,
 * then signs them out globally so they must re-login with the new password.
 */
export async function completePasswordReset(newPassword) {
  if (!supabase) {
    throw new Error('Hệ thống xác thực chưa được cấu hình.');
  }
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    throw new Error(error.message || 'Không thể đặt lại mật khẩu.');
  }
  // Invalidate the temporary recovery session everywhere.
  await supabase.auth.signOut({ scope: 'global' }).catch(() => {});
  return true;
}
