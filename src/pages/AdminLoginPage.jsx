import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient.js';
import { loginCandidate } from '../api/authApi.js';
import { setRemember, setStoredToken, setStoredUser, clearStoredAuth } from '../lib/authStorage.js';
import { Theme } from '@astryxdesign/core/theme';
import { gothicTheme } from '@astryxdesign/theme-gothic';
import { Center } from '@astryxdesign/core/Center';
import { VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Link } from '@astryxdesign/core/Link';
import { Banner } from '../components/astryx/Banner.jsx';

// Same background image as the Astryx "Login SSO" playground reference
// (astryx.atmeta.com/playground). This is Meta's own public demo asset —
// fine for prototyping, but for production this should be swapped for a
// self-hosted image so the page doesn't depend on Astryx's CDN staying up.
const BG_URL = 'https://lookaside.facebook.com/assets/astryx/building.png';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Adapted from the decoded Astryx playground source for "Login SSO"
 * (Center > Card > VStack, TextInput x2, Button primary, Link) — using the
 * REAL Astryx components (not swizzled) under a locally-scoped `gothicTheme`,
 * since Gothic ("dark-only atmospheric theme") is what gives the dark glass
 * card look in the reference screenshot. The rest of the app stays on
 * `neutralTheme` (wired in App.jsx); nesting a second <Theme> here only
 * affects this page's subtree.
 * The SSO divider/button from the template were dropped entirely — this
 * admin portal has no real SSO providers.
 */
export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const isSupabaseConfigured = Boolean(supabase);

  const [alreadyAdmin, setAlreadyAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function checkCurrentSession() {
      if (localStorage.getItem('nextplease:admin-bypass')) {
        localStorage.removeItem('nextplease:admin-bypass');
      }
      if (import.meta.env.DEV && sessionStorage.getItem('nextplease:admin-bypass') === 'true') {
        if (isMounted) { setAlreadyAdmin(true); setChecking(false); }
        return;
      }
      if (!isSupabaseConfigured) {
        if (isMounted) setChecking(false);
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && isMounted) {
          const token = session.access_token;
          const parts = token.split('.');
          if (parts.length >= 2) {
            const payload = JSON.parse(atob(parts[1]));
            const roles = payload.app_metadata?.roles || [];
            if (roles.includes('admin')) {
              setAlreadyAdmin(true);
            }
          }
        }
      } catch (err) {
        console.error('Lỗi khi kiểm tra admin session:', err);
      } finally {
        if (isMounted) setChecking(false);
      }
    }
    checkCurrentSession();
    return () => { isMounted = false; };
  }, [isSupabaseConfigured]);

  if (checking) {
    return (
      <div className="route-loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontSize: '1rem', fontWeight: '600', color: '#5b6472' }}>
        Đang kiểm tra phiên làm việc...
      </div>
    );
  }

  if (alreadyAdmin) {
    return <Navigate to="/nextplease-admin-portal/b2b-reviews" replace />;
  }

  const emailValid = isValidEmail(email);

  async function handleSignIn() {
    setStatus({ type: 'loading', message: 'Đang kiểm tra quyền quản trị viên...' });

    if (!email.trim() || !password.trim()) {
      setStatus({ type: 'error', message: 'Vui lòng nhập đầy đủ email và mật khẩu.' });
      return;
    }

    if (!isSupabaseConfigured) {
      if (!import.meta.env.DEV) {
        setStatus({ type: 'error', message: 'Hệ thống xác thực chưa được cấu hình. Vui lòng liên hệ quản trị.' });
        return;
      }
      setStatus({ type: 'success', message: 'Đăng nhập Admin giả lập thành công (Dev mode).' });
      sessionStorage.setItem('nextplease:admin-bypass', 'true');
      navigate('/nextplease-admin-portal/b2b-reviews');
      return;
    }

    try {
      // Admin sessions are never "remembered" — always tab-scoped (sessionStorage).
      setRemember(false);
      const response = await loginCandidate(email, password);
      const roles = response.user?.roles || [];
      if (!roles.includes('admin')) {
        setStatus({ type: 'error', message: 'Tài khoản này không có quyền truy cập trang quản trị.' });
        return;
      }
      if (response.accessToken) {
        setStoredToken(response.accessToken);
      }
      if (response.user) {
        setStoredUser(response.user);
      }
      if (supabase && response.accessToken && response.refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: response.accessToken,
          refresh_token: response.refreshToken,
        });
        if (error) console.warn('Supabase setSession warning (non-blocking):', error.message);
      }
      navigate('/nextplease-admin-portal/b2b-reviews');
    } catch (error) {
      clearStoredAuth();
      setStatus({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Đăng nhập thất bại.',
      });
    }
  }

  return (
    <Theme theme={gothicTheme}>
      <div
        className="np-admin-auth"
        style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', marginTop: '-34px', minHeight: '100vh' }}
      >
        <Center
          axis="both"
          style={{
            minHeight: '100vh',
            backgroundImage: `url(${BG_URL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '24px',
          }}
        >
          <Card padding={8} width="100%" maxWidth={480}>
            <VStack gap={4} hAlign="stretch">
              <VStack gap={1} hAlign="center">
                <Text type="display-1" as="h2">Welcome back</Text>
                <Text type="body" color="secondary" size="sm">Đăng nhập bằng tài khoản Admin do hệ thống cấp</Text>
              </VStack>

              <VStack gap={2}>
                <TextInput
                  label="Email admin"
                  isLabelHidden
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={setEmail}
                  size="lg"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSignIn(); }}
                />
                <TextInput
                  label="Password"
                  isLabelHidden
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={setPassword}
                  size="lg"
                />
              </VStack>

              <Link href="#" size="sm" color="secondary" type="supporting">
                Gặp sự cố khi đăng nhập?
              </Link>

              {(status.type === 'error' || status.type === 'success') && (
                <Banner
                  status={status.type}
                  title={status.type === 'error' ? 'Không thể đăng nhập' : 'Thành công'}
                  description={status.message}
                  isDismissable
                  onDismiss={() => setStatus({ type: 'idle', message: '' })}
                />
              )}

              <Button
                label={status.type === 'loading' ? 'Đang đăng nhập...' : 'Sign in'}
                variant="primary"
                size="lg"
                onClick={handleSignIn}
                isDisabled={!emailValid || !password}
                isLoading={status.type === 'loading'}
              />

              <VStack hAlign="center">
                <Text type="supporting" color="secondary">
                  Chưa có tài khoản?{' '}
                  <Link href="mailto:support@nextplease.dev" type="supporting">Liên hệ quản trị hệ thống</Link>
                </Text>
              </VStack>
            </VStack>
          </Card>
        </Center>
      </div>
    </Theme>
  );
}
