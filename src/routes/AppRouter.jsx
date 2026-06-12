import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { AdminPage } from '../pages/AdminPage.jsx';
import { BusinessPage } from '../pages/BusinessPage.jsx';
import { HomePage } from '../pages/HomePage.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';
import { UserPage } from '../pages/UserPage.jsx';

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

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route
          path="/portfolio"
          element={
            <Suspense fallback={<div className="route-loading">Đang dựng Portfolio 3D...</div>}>
              <CandidatePortfolioPage />
            </Suspense>
          }
        />
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
