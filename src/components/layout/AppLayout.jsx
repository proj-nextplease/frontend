import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header.jsx';

export function AppLayout() {
  const location = useLocation();
  const isBusinessWorkspace = location.pathname.startsWith('/businesses/dashboard');
  const isAdminWorkspace = location.pathname.startsWith('/nextplease-admin-portal/b2b-reviews');
  const isCandidateWorkspace = location.pathname.startsWith('/candidates/dashboard');
  const isWorkspace = isBusinessWorkspace || isAdminWorkspace || isCandidateWorkspace;
  const isLandingPage = ['/', '/candidates', '/businesses', '/terms', '/privacy'].includes(location.pathname);
  const isAuthPage = location.pathname.endsWith('/login') || location.pathname.endsWith('/register') || location.pathname.endsWith('/accept-invite')
    || location.pathname === '/forgot-password' || location.pathname === '/reset-password';
  // Standalone detail tabs render their own hero + "Đóng tab" control, so the
  // global header would be redundant. These are opened in a new browser tab.
  const isStandaloneTab = location.pathname.startsWith('/jobs/')
    || location.pathname.startsWith('/quests/')
    || location.pathname.startsWith('/portfolio/view/')
    || location.pathname.startsWith('/portfolio/preview');
  // The portfolio builder (create + edit) is a workspace tool like the candidate
  // dashboard, not a marketing page — it renders its own back-link + hero, so the
  // generic marketing Header (with its "Về chúng tôi" link and text-button theme
  // toggle) reads as an inconsistent, bolted-on chrome here.
  const isPortfolioBuilder = location.pathname === '/portfolio' || location.pathname === '/portfolio/edit';
  // These portfolio routes render their own full-bleed page background (flat,
  // no header). Without `business-workspace-shell`, `.app-shell`'s decorative
  // mesh-gradient (blue/orange corner blobs) peeks through the `.app-main` top
  // padding that used to sit under the now-removed header.
  const isPortfolioNoHeaderRoute = isPortfolioBuilder
    || location.pathname.startsWith('/portfolio/view/')
    || location.pathname.startsWith('/portfolio/preview');

  return (
    <div className={`app-shell ${isWorkspace || isPortfolioNoHeaderRoute ? 'business-workspace-shell' : ''}`}>
      {!isWorkspace && !isLandingPage && !isAuthPage && !isStandaloneTab && !isPortfolioBuilder && <Header />}
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
