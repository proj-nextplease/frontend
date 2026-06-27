import { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { BusinessPage } from '../pages/BusinessPage.jsx';
import { CandidateDashboardPage } from '../pages/CandidateDashboardPage.jsx';
import { CandidateLandingPage } from '../pages/CandidateLandingPage.jsx';
import { CandidateLoginPage } from '../pages/CandidateLoginPage.jsx';
import { CandidateRegisterPage } from '../pages/CandidateRegisterPage.jsx';
import { HomePage } from '../pages/HomePage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';
import { supabase } from '../services/supabaseClient.js';
import { getMyPortfolio } from '../api/portfolioApi.js';
import { BusinessLoginPage } from '../pages/BusinessLoginPage.jsx';
import { BusinessRegisterPage } from '../pages/BusinessRegisterPage.jsx';
import { AcceptInvitePage } from '../pages/AcceptInvitePage.jsx';
import { AdminB2bReviewPage } from '../pages/AdminB2bReviewPage.jsx';
import { BusinessLandingPage } from '../pages/BusinessLandingPage.jsx';
import { AdminLoginPage } from '../pages/AdminLoginPage.jsx';
import { JobDetailPage } from '../pages/JobDetailPage.jsx';
import { CandidatePortfolioViewPage } from '../pages/CandidatePortfolioViewPage.jsx';
import { getCurrentRoles, isAdmin, isBusiness } from '../lib/authRoles.js';

const CandidatePortfolioPage = lazy(() =>
  import('../pages/CandidatePortfolioPage.jsx').then((module) => ({
    default: module.CandidatePortfolioPage,
  })),
);

const CandidatePortfolioPreviewPage = lazy(() =>
  import('../pages/CandidatePortfolioPreviewPage.jsx').then((module) => ({
    default: module.CandidatePortfolioPreviewPage,
  })),
);

function ProtectedDashboardRoute() {
  const [session, setSession] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (currentSession) {
          setSession(currentSession);
          try {
            const data = await getMyPortfolio();
            if (isMounted) {
              setPortfolio(data);
            }
          } catch (err) {
            console.error("Lỗi khi tải portfolio trong wrapper:", err);
          }
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra session:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase
      ? supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (!isMounted) return;
          if (newSession) {
            setSession(newSession);
            try {
              const data = await getMyPortfolio();
              if (isMounted) setPortfolio(data);
            } catch (err) {
              console.error(err);
            }
          } else {
            setSession(null);
            setPortfolio(null);
          }
          setLoading(false);
        })
      : { data: { subscription: null } };

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="route-loading" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        fontSize: '1.25rem',
        fontWeight: '600',
        color: 'var(--muted)',
        background: 'var(--bg)',
      }}>
        Đang đồng bộ dữ liệu ứng viên...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/candidate/login" replace />;
  }

  // User has session. Gate on onboarding: a brand-new account (e.g. first social
  // login) has no portfolio yet, or one with onboardingCompleted=false — both must
  // finish the portfolio first. Only a completed portfolio may reach the dashboard.
  if (!portfolio || !portfolio.onboardingCompleted) {
    return <Navigate to="/portfolio" replace />;
  }

  return <CandidateDashboardPage initialPortfolio={portfolio} />;
}

function ProtectedPortfolioRoute({ isEditing = false }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (currentSession) {
          setSession(currentSession);
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra session:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkSession();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="route-loading" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        fontSize: '1.25rem',
        fontWeight: '600',
        color: 'var(--muted)',
        background: 'var(--bg)',
      }}>
        Đang tải trang Portfolio...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/candidate/login" replace />;
  }

  return (
    <Suspense fallback={<div className="route-loading">Đang dựng Portfolio 3D...</div>}>
      <CandidatePortfolioPage isEditing={isEditing} />
    </Suspense>
  );
}

function ProtectedBusinessRoute() {
  // 'checking' → 'granted' (business role) → 'no-session' (login) → 'wrong-role'
  const [access, setAccess] = useState('checking');

  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      // When Supabase isn't configured (pure dev), skip the gate entirely.
      const supabaseConfigured = Boolean(supabase);
      const storedToken = sessionStorage.getItem('nextplease:access_token');

      let hasSession = false;
      if (supabaseConfigured) {
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          hasSession = Boolean(currentSession);
        } catch (err) {
          console.error("Lỗi khi kiểm tra session B2B:", err);
        }
      }
      if (!hasSession && storedToken) {
        hasSession = true;
      }
      if (!supabaseConfigured && !storedToken) {
        // No auth backend wired up at all – allow through for local UI work.
        if (isMounted) setAccess('granted');
        return;
      }

      if (!hasSession) {
        if (isMounted) setAccess('no-session');
        return;
      }

      // Has a session – now confirm the role actually belongs to the B2B space.
      // Admins may pass through too (they manage B2B). Candidates are bounced.
      const roles = await getCurrentRoles();
      if (isMounted) {
        setAccess(isBusiness(roles) || isAdmin(roles) ? 'granted' : 'wrong-role');
      }
    }
    checkSession();
    return () => { isMounted = false; };
  }, []);

  if (access === 'checking') {
    return (
      <div className="route-loading" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', fontSize: '1.25rem', fontWeight: '600',
        color: 'var(--muted)', background: 'var(--bg)',
      }}>
        Đang tải trang đối tác...
      </div>
    );
  }

  if (access === 'no-session') {
    return <Navigate to="/business/login" replace />;
  }

  if (access === 'wrong-role') {
    // Logged in, but not a business account – send them to the candidate area.
    return <Navigate to="/candidates/dashboard" replace />;
  }

  return <BusinessPage />;
}

function ProtectedAdminRoute() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      // Helper: decode JWT and check admin role
      function hasAdminRole(token) {
        try {
          const parts = token.split('.');
          if (parts.length < 2) return false;
          const payload = JSON.parse(atob(parts[1]));
          const roles = payload.app_metadata?.roles || [];
          return roles.includes('admin');
        } catch {
          return false;
        }
      }

      // 1. sessionStorage bypass — ONLY honored in dev builds. In production
      //    this flag is ignored so a manually-set sessionStorage value can't
      //    grant access to the admin UI.
      if (import.meta.env.DEV && sessionStorage.getItem('nextplease:admin-bypass') === 'true') {
        if (isMounted) { setIsAdmin(true); setLoading(false); }
        return;
      }

      // 2. sessionStorage token (primary — set after BE login)
      const storedToken = sessionStorage.getItem('nextplease:access_token');
      if (storedToken) {
        if (hasAdminRole(storedToken) && isMounted) {
          setIsAdmin(true);
        }
        if (isMounted) setLoading(false);
        return;
      }

      // 3. Supabase session fallback
      if (supabase) {
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (!isMounted) return;
          if (currentSession && hasAdminRole(currentSession.access_token)) {
            setIsAdmin(true);
          }
        } catch (err) {
          console.error("Lỗi khi kiểm tra session admin:", err);
        }
      }

      if (isMounted) setLoading(false);
    }
    checkSession();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="route-loading" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', fontSize: '1.25rem', fontWeight: '600',
        color: 'var(--muted)', background: 'var(--bg)',
      }}>
        Đang xác thực quyền Admin...
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/nextplease-admin-portal/login" replace />;
  }

  return <AdminB2bReviewPage />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/candidates" element={<CandidateLandingPage />} />
        <Route path="/candidates/dashboard" element={<ProtectedDashboardRoute />} />
        <Route path="/candidates/dashboard/:tabSlug" element={<ProtectedDashboardRoute />} />
        <Route path="/candidate/dashboard" element={<Navigate to="/candidates/dashboard/overview" replace />} />
        <Route path="/candidate/login" element={<CandidateLoginPage />} />
        <Route path="/candidate/register" element={<CandidateRegisterPage />} />
        
        {/* B2B Authentication and Dashboard Routes */}
        <Route path="/business/login" element={<BusinessLoginPage />} />
        <Route path="/business/register" element={<BusinessRegisterPage />} />
        <Route path="/business/accept-invite" element={<AcceptInvitePage />} />
        <Route path="/businesses" element={<BusinessLandingPage />} />
        <Route path="/businesses/dashboard" element={<ProtectedBusinessRoute />} />
        <Route path="/businesses/dashboard/:tabSlug" element={<ProtectedBusinessRoute />} />
        <Route path="/business/dashboard" element={<Navigate to="/businesses/dashboard" replace />} />
        
        {/* Private Admin review portal */}
        <Route path="/nextplease-admin-portal/login" element={<AdminLoginPage />} />
        <Route path="/nextplease-admin-portal/b2b-reviews" element={<ProtectedAdminRoute />} />
        <Route path="/nextplease-admin-portal/b2b-reviews/:tabSlug" element={<ProtectedAdminRoute />} />
        <Route path="/nextplease-admin-portal/b2b-reviews/:tabSlug/:subTabSlug" element={<ProtectedAdminRoute />} />

        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/quests/:id" element={<JobDetailPage />} />
        <Route path="/portfolio/view/:userId" element={<CandidatePortfolioViewPage />} />
        <Route path="/portfolio" element={<ProtectedPortfolioRoute isEditing={false} />} />
        <Route path="/portfolio/edit" element={<ProtectedPortfolioRoute isEditing={true} />} />
        <Route
          path="/portfolio/preview"
          element={
            <Suspense fallback={<div className="route-loading">Đang mở bản xem trước...</div>}>
              <CandidatePortfolioPreviewPage />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
