import { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { AdminPage } from '../pages/AdminPage.jsx';
import { BusinessPage } from '../pages/BusinessPage.jsx';
import { CandidateDashboardPage } from '../pages/CandidateDashboardPage.jsx';
import { CandidateLandingPage } from '../pages/CandidateLandingPage.jsx';
import { CandidateLoginPage } from '../pages/CandidateLoginPage.jsx';
import { CandidateRegisterPage } from '../pages/CandidateRegisterPage.jsx';
import { HomePage } from '../pages/HomePage.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';
import { UserPage } from '../pages/UserPage.jsx';
import { supabase } from '../services/supabaseClient.js';
import { getMyPortfolio } from '../api/portfolioApi.js';

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

  // User has session. Check if onboarding is completed
  if (portfolio && !portfolio.onboardingCompleted) {
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

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/candidates" element={<CandidateLandingPage />} />
        <Route path="/candidates/dashboard" element={<ProtectedDashboardRoute />} />
        <Route path="/candidate/dashboard" element={<Navigate to="/candidates/dashboard" replace />} />
        <Route path="/candidate/login" element={<CandidateLoginPage />} />
        <Route path="/candidate/register" element={<CandidateRegisterPage />} />
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
        <Route path="/users" element={<UserPage />} />
        <Route path="/businesses" element={<BusinessPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
