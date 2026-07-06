import { Link } from 'react-router-dom';
import { Theme } from '@astryxdesign/core/theme';
import { LinkProvider } from '@astryxdesign/core/Link';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { AppRouter } from './routes/AppRouter.jsx';
import { ThemeProvider } from './lib/themeContext.jsx';
import { FloatingThemeToggle } from './components/ThemeToggle.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <Theme theme={neutralTheme}>
        <LinkProvider component={Link}>
          <AppRouter />
          <FloatingThemeToggle />
        </LinkProvider>
      </Theme>
    </ThemeProvider>
  );
}
