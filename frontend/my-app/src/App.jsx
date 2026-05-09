import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";

const LandingPage = lazy(async () => {
  const m = await import("./pages/LandingPage.jsx");
  return { default: m.LandingPage };
});
const SearchPage = lazy(async () => {
  const m = await import("./pages/SearchPage.jsx");
  return { default: m.SearchPage };
});
const AboutPage = lazy(async () => {
  const m = await import("./pages/AboutPage.jsx");
  return { default: m.AboutPage };
});
const LoginPage = lazy(async () => {
  const m = await import("./pages/LoginPage.jsx");
  return { default: m.LoginPage };
});
const RegisterPage = lazy(async () => {
  const m = await import("./pages/RegisterPage.jsx");
  return { default: m.RegisterPage };
});
const PharmacyDashboardPage = lazy(async () => {
  const m = await import("./pages/PharmacyDashboardPage.jsx");
  return { default: m.PharmacyDashboardPage };
});
const ScanAddMedicinePage = lazy(async () => {
  const m = await import("./pages/ScanAddMedicinePage.jsx");
  return { default: m.ScanAddMedicinePage };
});
const InventoryPage = lazy(async () => {
  const m = await import("./pages/InventoryPage.jsx");
  return { default: m.InventoryPage };
});
const ProfilePage = lazy(async () => {
  const m = await import("./pages/ProfilePage.jsx");
  return { default: m.ProfilePage };
});
const CustomerDashboardPage = lazy(async () => {
  const m = await import("./pages/CustomerDashboardPage.jsx");
  return { default: m.CustomerDashboardPage };
});

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-3 text-base-content/70">
      <span className="loading loading-spinner loading-lg text-primary" aria-hidden />
      <p className="text-sm">Loading…</p>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireRole="owner">
                <PharmacyDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer-dashboard"
            element={
              <ProtectedRoute requireRole="user">
                <CustomerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute requireRole="owner">
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scan"
            element={
              <ProtectedRoute requireRole="owner">
                <ScanAddMedicinePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
