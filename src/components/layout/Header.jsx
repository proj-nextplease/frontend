import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { Link } from 'react-router-dom';
import { Moon, Sparkles, Sun } from 'lucide-react';

const THEME_STORAGE_KEY = 'nextplease:theme';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function Header() {
  const [theme, setTheme] = useState(getInitialTheme);
  const isDarkTheme = theme === 'dark';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    const nextTheme = isDarkTheme ? 'light' : 'dark';

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        flushSync(() => setTheme(nextTheme));
      });
      return;
    }

    document.documentElement.classList.add('theme-transitioning');
    setTheme(nextTheme);
    window.setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 460);
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" to="/">
          <span className="brand-mark">
            <Sparkles size={18} />
          </span>
          <span>nextplease</span>
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          <Link to="/#about">Về chúng tôi</Link>
          <button
            aria-label={isDarkTheme ? 'Chuyển sang nền sáng' : 'Chuyển sang nền tối'}
            className="theme-toggle"
            onClick={toggleTheme}
            type="button"
          >
            <span className="theme-toggle-icon">
              {isDarkTheme ? <Sun size={16} /> : <Moon size={16} />}
            </span>
            <span>{isDarkTheme ? 'Sáng' : 'Tối'}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
