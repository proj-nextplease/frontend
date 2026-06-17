import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header.jsx';

export function AppLayout() {
  const location = useLocation();
  const isBusinessWorkspace = location.pathname.startsWith('/businesses/dashboard');
  const isAdminWorkspace = location.pathname.startsWith('/nextplease-admin-portal/b2b-reviews');
  const isCandidateWorkspace = location.pathname.startsWith('/candidates/dashboard');
  const isWorkspace = isBusinessWorkspace || isAdminWorkspace || isCandidateWorkspace;

  return (
    <div className={`app-shell ${isWorkspace ? 'business-workspace-shell' : ''}`}>
      {!isWorkspace && <Header />}
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
