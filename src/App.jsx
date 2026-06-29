import { AppRouter } from './routes/AppRouter.jsx';
import { ThemeProvider } from './lib/themeContext.jsx';
import { FloatingThemeToggle } from './components/ThemeToggle.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <AppRouter />
      <FloatingThemeToggle />
    </ThemeProvider>
  );
}
