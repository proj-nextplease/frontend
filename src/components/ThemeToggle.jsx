import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/themeContext.jsx';
import { getStoredToken } from '../lib/authStorage.js';

/** Inline theme toggle — used inside the Header nav. */
export function ThemeToggle({ className = 'theme-toggle' }) {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      className={className}
      onClick={(e) => toggleTheme(e)}
      aria-label={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      title={isDark ? 'Giao diện sáng' : 'Giao diện tối'}
    >
      <span className="theme-toggle-icon" key={isDark ? 'sun' : 'moon'}>
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </span>
    </button>
  );
}

/** Floating toggle — only shown on authenticated workspace sites / when logged in. */
export function FloatingThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [hasToken, setHasToken] = useState(() => !!getStoredToken());

  useEffect(() => {
    function checkAuth() {
      setHasToken(!!getStoredToken());
    }
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [location.pathname]);

  const isAdminPath = location.pathname.includes('/nextplease-admin-portal') || location.pathname.includes('/admin');

  // Public unauthenticated marketing / landing / detail / auth pages where dark mode floating button should NOT appear:
  const isPublicMarketingRoute = [
    '/',
    '/jobs',
    '/candidates',
    '/businesses',
    '/terms',
    '/privacy',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/accept-invite',
  ].includes(location.pathname) || location.pathname.startsWith('/jobs/') || location.pathname.startsWith('/quests/');

  // If user is not logged in or is on a public unauthenticated site, hide the floating toggle button
  if (isAdminPath || !hasToken || isPublicMarketingRoute) {
    return null;
  }

  return (
    <button
      type="button"
      className="np-floating-theme-toggle"
      onClick={(e) => toggleTheme(e)}
      aria-label={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      title={isDark ? 'Giao diện sáng' : 'Giao diện tối'}
    >
      <span className="np-floating-theme-icon" key={isDark ? 'sun' : 'moon'}>
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </span>
    </button>
  );
}
