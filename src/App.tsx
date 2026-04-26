import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { useAuth } from "./context/AuthContext";

// Lazy load all pages for code splitting
const AuthPage = lazy(() => import("./pages/AuthPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const DashboardTradingPage = lazy(() => import("./pages/DashboardTradingPage"));
const WithdrawalsPage = lazy(() => import("./pages/WithdrawalsPage"));
const DepositsPage = lazy(() => import("./pages/DepositsPage"));
const RewardsPage = lazy(() => import("./pages/RewardsPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ReferralsPage = lazy(() => import("./pages/ReferralsPage"));

// Loading component for Suspense fallback
function PageLoader() {
  return (
    <div className="min-h-screen bg-(--background-default) flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-(--primary-default)"></div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  return session ? <>{children}</> : <Navigate to="/auth" replace />;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  return !session ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/auth"
          element={
            <GuestRoute>
              <AuthPage />
            </GuestRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/trading"
          element={
            <ProtectedRoute>
              <DashboardTradingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/withdrawals"
          element={
            <ProtectedRoute>
              <WithdrawalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/deposits"
          element={
            <ProtectedRoute>
              <DepositsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/rewards"
          element={
            <ProtectedRoute>
              <RewardsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/referrals"
          element={
            <ProtectedRoute>
              <ReferralsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default App;
