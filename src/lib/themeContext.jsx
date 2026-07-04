import { createContext, useContext, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

const THEME_STORAGE_KEY = 'nextplease:theme';

const ThemeContext = createContext({ theme: 'light', isDark: false, setTheme: () => {}, toggleTheme: () => {} });

/** Default is LIGHT for everyone; only an explicit saved choice overrides it. */
function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
  return saved === 'dark' || saved === 'light' ? saved : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  // Apply theme to <html> and persist whenever it changes.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Animated theme switch: a circular reveal that wipes the new theme out from
  // the point the user clicked (via the View Transition API). Falls back to a
  // plain cross-fade class when the API or motion isn't available.
  const setTheme = (next, origin) => {
    if (next !== 'light' && next !== 'dark') return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (!document.startViewTransition || prefersReducedMotion) {
      document.documentElement.classList.add('theme-transitioning');
      setThemeState(next);
      window.setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 460);
      return;
    }

    // Origin = click point (falls back to the top-right, where the toggle lives).
    const x = origin?.x ?? window.innerWidth - 48;
    const y = origin?.y ?? 48;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    document.documentElement.classList.add('theme-reveal');
    const transition = document.startViewTransition(() => flushSync(() => setThemeState(next)));
    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 620,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            pseudoElement: '::view-transition-new(root)',
          },
        );
      })
      .catch(() => {});
    transition.finished.finally(() => {
      document.documentElement.classList.remove('theme-reveal');
    });
  };

  const toggleTheme = (event) => {
    let origin;
    // Prefer the exact click point; fall back to the center of the toggle button.
    if (event && typeof event.clientX === 'number' && (event.clientX || event.clientY)) {
      origin = { x: event.clientX, y: event.clientY };
    } else if (event?.currentTarget?.getBoundingClientRect) {
      const r = event.currentTarget.getBoundingClientRect();
      origin = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    setTheme(theme === 'dark' ? 'light' : 'dark', origin);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  return useContext(ThemeContext);
}
