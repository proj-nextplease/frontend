import { httpClient } from './httpClient.js';
import { supabase } from '../services/supabaseClient.js';

export async function getAccountSettings() {
  const response = await httpClient.get('/account/me');
  return response.data.data;
}

/** Resolves the current user's app_users id — needed to build the public /portfolio/view/:userId share link. */
export async function getMyUserId() {
  const response = await httpClient.get('/me');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể lấy thông tin tài khoản.');
  }
  return response.data.data.appUserId;
}

export async function updateDisplayName(displayName) {
  const response = await httpClient.put('/account/display-name', { displayName });
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể cập nhật tên hiển thị.');
  }
  return response.data.message;
}

export async function updateNotificationPreferences({ emailEnabled, pushEnabled, inAppEnabled }) {
  const response = await httpClient.put('/account/notification-preferences', {
    emailEnabled,
    pushEnabled,
    inAppEnabled,
  });
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể cập nhật tùy chọn thông báo.');
  }
  return response.data.message;
}

/**
 * Changes the logged-in user's password: verifies the current password via
 * Supabase (throws if wrong), then sets the new one. Mirrors the exact
 * mechanism already used by ResetPasswordPage's completePasswordReset —
 * `supabase.auth.updateUser({ password })` — but re-authenticates first
 * since this isn't a recovery-link session.
 */
export async function changePassword(email, currentPassword, newPassword) {
  if (!supabase) {
    throw new Error('Hệ thống xác thực chưa được cấu hình.');
  }
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password: currentPassword,
  });
  if (verifyError) {
    throw new Error('Mật khẩu hiện tại không chính xác.');
  }
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) {
    throw new Error(updateError.message || 'Không thể đổi mật khẩu.');
  }
  return true;
}

export async function updatePrivacySettings({ isPublic, openToWork }) {
  const response = await httpClient.put('/account/privacy', { isPublic, openToWork });
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể cập nhật quyền riêng tư.');
  }
  return response.data.message;
}

/** Revokes every active session (all devices, including this one) via Supabase logout scope=global. */
export async function signOutAllSessions() {
  const response = await httpClient.post('/account/sign-out-all-sessions');
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể đăng xuất khỏi tất cả thiết bị.');
  }
  return response.data.message;
}

/** Freezes the account (self-service deactivation) — requires current password. */
export async function deactivateAccount(password) {
  const response = await httpClient.post('/account/deactivate', { password });
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Không thể vô hiệu hóa tài khoản.');
  }
  return response.data.message;
}
