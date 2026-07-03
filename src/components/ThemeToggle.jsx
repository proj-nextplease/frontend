import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/themeContext.jsx';

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
      <span className="theme-toggle-icon" key={isDark ? 'sun' : 'moon'}>{isDark ? <Sun size={16} /> : <Moon size={16} />}</span>
    </button>
  );
}

/** Floating toggle — rendered app-wide so every page (landing, auth, workspace) can switch themes. */
export function FloatingThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const isAdminPath = window.location.pathname.includes('/nextplease-admin-portal') || window.location.pathname.includes('/admin');
  if (isAdminPath) return null;

  return (
    <button
      type="button"
      className="np-floating-theme-toggle"
      onClick={(e) => toggleTheme(e)}
      aria-label={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      title={isDark ? 'Giao diện sáng' : 'Giao diện tối'}
    >
      <span className="np-floating-theme-icon" key={isDark ? 'sun' : 'moon'}>{isDark ? <Sun size={18} /> : <Moon size={18} />}</span>
    </button>
  );
}
