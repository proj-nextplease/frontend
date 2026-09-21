import { Link } from 'react-router-dom';
import { Theme } from '@astryxdesign/core/theme';
import { LinkProvider } from '@astryxdesign/core/Link';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { AppRouter } from './routes/AppRouter.jsx';
import { ThemeProvider } from './lib/themeContext.jsx';
import { AuthModalProvider } from './context/AuthModalContext.jsx';
import { ConsentGuard } from './components/ConsentGuard.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <Theme theme={neutralTheme}>
        <LinkProvider component={Link}>
          <AuthModalProvider>
            <AppRouter />
            {/* Đặt ngoài router: điều kiện chặn là "tài khoản chưa đồng ý",
                không phụ thuộc đang ở route nào. */}
            <ConsentGuard />
          </AuthModalProvider>
        </LinkProvider>
      </Theme>
    </ThemeProvider>
  );
}
