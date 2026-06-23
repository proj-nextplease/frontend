import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header.jsx';

export function AppLayout() {
  const location = useLocation();
  const isBusinessWorkspace = location.pathname.startsWith('/businesses/dashboard');
  const isAdminWorkspace = location.pathname.startsWith('/nextplease-admin-portal/b2b-reviews');
  const isCandidateWorkspace = location.pathname.startsWith('/candidates/dashboard');
  const isWorkspace = isBusinessWorkspace || isAdminWorkspace || isCandidateWorkspace;
  const isLandingPage = ['/', '/candidates', '/businesses'].includes(location.pathname);
  const isAuthPage = location.pathname.endsWith('/login') || location.pathname.endsWith('/register') || location.pathname.endsWith('/accept-invite');
  // Standalone detail tabs render their own hero + "Đóng tab" control, so the
  // global header would be redundant. These are opened in a new browser tab.
  const isStandaloneTab = location.pathname.startsWith('/jobs/')
    || location.pathname.startsWith('/quests/')
    || location.pathname.startsWith('/portfolio/view/');

  return (
    <div className={`app-shell ${isWorkspace ? 'business-workspace-shell' : ''}`}>
      {!isWorkspace && !isLandingPage && !isAuthPage && !isStandaloneTab && <Header />}
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
