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

  // Animated theme switch: prefer the View Transition API, fall back to a CSS class.
  const setTheme = (next) => {
    if (next !== 'light' && next !== 'dark') return;
    if (document.startViewTransition) {
      document.startViewTransition(() => flushSync(() => setThemeState(next)));
      return;
    }
    document.documentElement.classList.add('theme-transitioning');
    setThemeState(next);
    window.setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 460);
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

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
