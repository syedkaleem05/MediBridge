import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";

import { LandingPage } from "./pages/LandingPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { SearchPage } from "./pages/SearchPage.jsx";
import { PharmacyDashboardPage } from "./pages/PharmacyDashboardPage.jsx";
import { ScanAddMedicinePage } from "./pages/ScanAddMedicinePage.jsx";
import { InventoryPage } from "./pages/InventoryPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { AboutPage } from "./pages/AboutPage.jsx";
import { CustomerDashboardPage } from "./pages/CustomerDashboardPage.jsx";

export default function App() {
  return (
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
  );
}

